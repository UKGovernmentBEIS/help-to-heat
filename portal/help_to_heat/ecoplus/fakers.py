import random
import string

import faker

from . import models

fake = faker.Faker()


def fake_epc_ratings(number=256):
    for _ in range(number):
        yield {
            "uprn": "".join(random.choices(string.digits, k=12)),
            "rating": random.choice(models.epc_rating_choices)[0],
            "date": fake.date_between(start_date="-12y"),
        }


def add_fake_epc_ratings(number=256):
    for epc_rating_datum in fake_epc_ratings(number):
        epc_rating = models.EpcRating(**epc_rating_datum)
        epc_rating.save()
        yield epc_rating