import datetime
import random
import string

import django.db.utils
from help_to_heat.portal import models
from nose.tools import assert_raises

from . import utils


@utils.with_client
def test_epc_duplicates(client):
    uprn = "".join(random.choices(string.digits, k=5))
    data = {
        "uprn": uprn,
"rating": "A",
        "date": datetime.date(2020, 12, 25),
    }
    epc1 = models.EpcRating(**data)
    epc1.save()
    with assert_raises(django.db.utils.IntegrityError):
        epc2 = models.EpcRating(**data)
        epc2.save()
