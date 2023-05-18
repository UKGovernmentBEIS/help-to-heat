from marshmallow import Schema, fields, validate

country_options = ("England", "Scotland", "Wales", "Northern Ireland")
own_property_options = (
    "Yes, I own my property and live in it",
    "No, I am a tenant",
    "No, I am a social housing tenant",
    "I am a property owner but lease my property to one or more tenants",
)
council_tax_band_options = ("A", "B", "C", "D", "E", "F", "G", "H")
yes_no_options = ("Yes", "No")


class SessionSchema(Schema):
    country = fields.String(validate=validate.OneOf(country_options))
    own_property = fields.String(validate=validate.OneOf(own_property_options))
    address_line_1 = fields.String()
    postcode = fields.String()
    council_tax_band = fields.String(validate=validate.OneOf(council_tax_band_options))
    benefits = fields.String(validate=validate.OneOf(yes_no_options))
