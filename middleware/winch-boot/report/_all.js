[
  {
    "_id": "e-sold-test",
    "handler": {
      "name": "e-sold-base",
      "params": {
        "i18n": {
          "locale": "en-GB",
          "timeZone": "Europe/London"
        },
        "period": "daily",
        "filter": {
          "projects": [
            "WP1"
          ]
        },
        "mailTemplate": "daily_reports"
      }
    },
    "notifications": [
      {
        "channel": "mail",
        "address": {
          "to": [
            "fabio.valenti@winchenergy.com"
          ]
        },
        "address_testRino": {
          "to": [
            "rino.magazu@winchenergy.com"
          ],
          "cc": [
            "fabio.valenti@winchenergy.com",
            "fabio.busa@winchenergy.com",
            "stefano.mastroeni@winchenergy.com"
          ]
        },
        "address_test2": {
          "to": [
            "fabio.valenti@winchenergy.com",
            "stefano.matroeni@winchenergy.com"
          ],
          "cc": [
            "fabio.busa@winchenergy.com"
          ],
          "bcc": [
            "leo.cavallaro@winchenergy.com"
          ]
        }
      }
    ]
  },
  {
    "_id": "e-sold-brief-wp1",
    "handler": {
      "name": "e-sold-base",
      "params": {
        "i18n": {
          "locale": "en-GB",
          "timeZone": "Europe/London"
        },
        "period": "daily",
        "filter": {
          "projects": [
            "WP1"
          ]
        },
        "mailTemplate": "daily_reports"
      }
    },
    "notifications": [
      {
        "channel": "mail",
        "address": {
          "to": [
            "rino.magazu@winchenergy.com",
            "nicholas.wrigley@winchenergy.com",
            "tom.wrigley@winchenergy.com",
            "chris.kanani@winchenergy.com",
            "pierre.johnson@winchenergy.com"
          ],
          "cc": [
            "leo.cavallaro@winchenergy.com",
            "fabio.busa@winchenergy.com"
          ],
          "bcc": [
            "fabio.valenti@winchenergy.com"
          ]
        }
      }
    ]
  },
  {
    "_id": "e-sold-brief-adido",
    "handler": {
      "name": "e-sold-base",
      "params": {
        "i18n": {
          "locale": "en-GB",
          "timeZone": "Europe/London"
        },
        "period": "daily",
        "filter": {
          "plants": [
            "|BEN|BEN_2019_005|1|"
          ]
        },
        "mailTemplate": "daily_reports"
      }
    },
    "notifications": [
      {
        "channel": "mail",
        "address": {
          "to": "fabio.valenti@winchenergy.com"
        },
        "address_PROD": {
          "to": [
            "rino.magazu@winchenergy.com",
            "nicholas.wrigley@winchenergy.com",
            "tom.wrigley@winchenergy.com",
            "charles.asper@ipm-int.com"
          ],
          "bcc": [
            "fabio.valenti@winchenergy.com"
          ]
        }
      }
    ]
  },
  {
    "_id": "e-sold-brief-wp1--test",
    "handler": {
      "name": "e-sold-base",
      "params": {
        "i18n": {
          "locale": "en-GB",
          "timeZone": "Europe/London"
        },
        "period": "daily",
        "filter": {
          "projects": [
            "WP1"
          ]
        },
        "mailTemplate": "daily_reports"
      }
    },
    "notifications": [
      {
        "channel": "mail",
        "address": {
          "to": [
            "fabio.valenti@winchenergy.com"
          ]
        }
      }
    ]
  },
  {
    "_id": "e-sold-brief-adido--test",
    "handler": {
      "name": "e-sold-base",
      "params": {
        "i18n": {
          "locale": "en-GB",
          "timeZone": "Europe/London"
        },
        "period": "daily",
        "filter": {
          "plants": [
            "|BEN|BEN_2019_005|1|"
          ]
        },
        "mailTemplate": "daily_reports"
      }
    },
    "notifications": [
      {
        "channel": "mail",
        "address": {
          "to": "fabio.valenti@winchenergy.com"
        }
      }
    ]
  },
  {
    "_id": "summary-wp1--test",
    "handler": {
      "name": "summary-base",
      "params": {
        "i18n": {
          "locale": "en-GB",
          "timeZone": "Europe/London"
        },
        "filter": {
          "projects": [
            "WP1"
          ]
        },
        "mailTemplate": "MON_2019_020_report_base"
      }
    },
    "notifications": [
      {
        "channel": "mail",
        "address": {
          "to": [
            "fabio.valenti@winchenergy.com"
          ],
          "cc": [
          ],
          "bcc": [
          ]
        }
      }
    ]
  }
]