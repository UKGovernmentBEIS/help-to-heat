import unittest
import uuid

from django.conf import settings
from help_to_heat.frontdoor import interface

from . import utils


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_flow_northern_ireland():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    form = page.get_form()
    form["country"] = "Northern Ireland"
    page = form.submit().follow()

    assert page.has_text("Not available in Northern Ireland")

    data = interface.api.session.get_answer(session_id, page_name="country")
    assert data["country"] == "Northern Ireland"


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_flow():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    _check_page = _make_check_page(session_id)

    form = page.get_form()
    form["country"] = "England"
    page = form.submit().follow()

    assert page.has_text("Do you own your property?")
    page = _check_page(page, "own-property", "own_property", "Yes, I own my property and live in it")

    assert page.has_one("h1:contains('What is the address of your property?')")

    form = page.get_form()
    form["address_line_1"] = "999 Letsby Avenue"
    form["postcode"] = "PO99 9PO"
    page = form.submit().follow()

    data = interface.api.session.get_answer(session_id, page_name="address")
    assert data["address_line_1"] == "999 Letsby Avenue"
    assert data["postcode"] == "PO99 9PO"

    assert page.has_one("h1:contains('What is the council tax band of your property?')")
    page = _check_page(page, "council-tax-band", "council_tax_band", "B")

    assert page.has_one("h1:contains('Is anyone in your household receiving any benefits?')")
    page = _check_page(page, "benefits", "benefits", "Yes")

    assert page.has_one("h1:contains('What is your annual household income?')")
    page = _check_page(page, "household-income", "household_income", "Less than £31,000 a year")

    assert page.has_one("h1:contains('What kind of property do you have?')")
    page = _check_page(page, "property-type", "property_type", "House")

    assert page.has_one("h1:contains('Number of bedrooms')")
    page = _check_page(page, "number-of-bedrooms", "number_of_bedrooms", "Two bedrooms")

    assert page.has_one("h1:contains('What kind of walls does your property have?')")
    page = _check_page(page, "wall-type", "wall_type", "Cavity walls")

    assert page.has_one("h1:contains('Are your walls insulated?')")
    page = _check_page(page, "wall-insulation", "wall_insulation", "No they are not insulated")

    assert page.has_one("h1:contains('Does this property have a loft?')")
    page = _check_page(page, "loft", "loft", "No")

    assert page.has_one("h1:contains('Is there access to your loft?')")
    page = _check_page(page, "loft-access", "loft_access", "Yes, there is access to my loft")


def _make_check_page(session_id):
    def _check_page(page, page_name, key, answer):
        form = page.get_form()
        form[key] = answer
        page = form.submit().follow()

        data = interface.api.session.get_answer(session_id, page_name=page_name)
        assert data[key] == answer
        return page

    return _check_page


@unittest.skipIf(not settings.SHOW_FRONTDOOR, "Frontdoor disabled")
def test_back_button():
    client = utils.get_client()
    page = client.get("/")

    assert page.status_code == 200
    assert page.has_one("h1:contains('Get home energy improvements')")

    page = page.click(contains="Start")
    assert page.status_code == 200

    session_id = page.path.split("/")[1]
    assert uuid.UUID(session_id)

    form = page.get_form()
    form["country"] = "England"
    page = form.submit().follow()

    assert page.has_text("Do you own your property?")

    form = page.get_form()
    form["own_property"] = "Yes, I own my property and live in it"
    page = form.submit().follow()

    assert page.has_one("h1:contains('What is the address of your property?')")

    page = page.click(contains=("Back"))

    form = page.get_form()
    assert form["own_property"] == "Yes, I own my property and live in it"

    page = page.click(contains=("Back"))

    form = page.get_form()
    assert form["country"] == "England"
