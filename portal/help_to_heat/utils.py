import enum
import types
import uuid

from django.http import HttpResponseNotAllowed
from django.db import models


class ChoicesMeta(enum.EnumMeta):
    """A metaclass for creating a enum choices."""

    def __new__(metacls, classname, bases, classdict, **kwds):
        labels = []
        for key in classdict._member_names:
            value = classdict[key]
            if isinstance(value, (list, tuple)) and len(value) > 1 and isinstance(value[-1], str):
                value, label = value
            elif hasattr(value, "name"):
                label = str(value.name)
            else:
                label = value
                value = key
            labels.append(label)
            # Use dict.__setitem__() to suppress defenses against double
            # assignment in enum's classdict.
            dict.__setitem__(classdict, key, value)
        cls = super().__new__(metacls, classname, bases, classdict, **kwds)
        for member, label in zip(cls.__members__.values(), labels):
            member._label_ = label
        return enum.unique(cls)

    def __contains__(cls, member):
        if not isinstance(member, enum.Enum):
            # Allow non-enums to match against member values.
            return any(x.value == member for x in cls)
        return super().__contains__(member)

    @property
    def names(cls):
        return tuple(member.name for member in cls)

    @property
    def choices(cls):
        return tuple((member.name, member.label) for member in cls)

    @property
    def labels(cls):
        return tuple(label for _, label in cls.choices)

    @property
    def values(cls):
        return tuple(value for value, _ in cls.choices)

    @property
    def options(cls):
        return tuple({"value": value, "text": text} for value, text in cls.choices)


class Choices(enum.Enum, metaclass=ChoicesMeta):
    """Class for creating enumerated choices."""

    @types.DynamicClassAttribute
    def label(self):
        return self._label_

    def __repr__(self):
        return f"{self.__class__.__qualname__}.{self._name_}"

    def __eq__(self, other):
        if self.__class__ is other.__class__:
            return super().__eq__(other)
        return self.value == other

    def __hash__(self):
        return hash(self._name_)


class MethodDispatcher:
    def __new__(cls, request, *args, **kwargs):
        view = super().__new__(cls)
        method_name = request.method.lower()
        method = getattr(view, method_name, None)
        if method:
            return method(request, *args, **kwargs)
        else:
            return HttpResponseNotAllowed(request)



class UUIDPrimaryKeyBase(models.Model):
    class Meta:
        abstract = True

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(editable=False, auto_now_add=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True)

    class Meta:
        abstract = True