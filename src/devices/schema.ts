export const defaultSchema = [
  {
    "switch": {
        "attr": 1665,
        "canTrigger": true,
        "code": "switch",
        "defaultRecommend": true,
        "editPermission": true,
        "executable": true,
        "extContent": "",
        "iconname": "icon-dp_power2",
        "id": 1,
        "mode": "rw",
        "name": "开关",
        "property": {
            "type": "bool"
        },
        "type": "obj"
    },
    "mode": {
        "attr": 1664,
        "canTrigger": true,
        "code": "mode",
        "defaultRecommend": true,
        "editPermission": true,
        "executable": true,
        "extContent": "",
        "iconname": "icon-dp_mode",
        "id": 2,
        "mode": "rw",
        "name": "模式",
        "property": {
            "range": [
                "undefined"
            ],
            "type": "enum"
        },
        "type": "obj"
    },
    "temp_set": {
        "attr": 1152,
        "canTrigger": true,
        "code": "temp_set",
        "defaultRecommend": false,
        "editPermission": true,
        "executable": true,
        "extContent": "",
        "iconname": "icon-set",
        "id": 9,
        "mode": "rw",
        "name": "温度设置（℃）",
        "property": {
            "unit": "℃",
            "min": 30,
            "max": 60,
            "scale": 0,
            "step": 1,
            "type": "value"
        },
        "type": "obj"
    },
    "power_consumption": {
        "attr": 1152,
        "canTrigger": true,
        "code": "power_consumption",
        "defaultRecommend": false,
        "editPermission": true,
        "executable": true,
        "extContent": "",
        "iconname": "icon-dp_battery",
        "id": 12,
        "mode": "ro",
        "name": "耗电量",
        "property": {
            "unit": "kwh",
            "min": 0,
            "max": 2147483647,
            "scale": 0,
            "step": 1,
            "type": "value"
        },
        "type": "obj"
    },
    "temp_unit_convert": {
        "attr": 1152,
        "canTrigger": true,
        "code": "temp_unit_convert",
        "defaultRecommend": false,
        "editPermission": true,
        "executable": true,
        "extContent": "",
        "iconname": "icon-dp_mode",
        "id": 17,
        "mode": "rw",
        "name": "温标切换",
        "property": {
            "range": [
                "c",
                "f"
            ],
            "type": "enum"
        },
        "type": "obj"
    },
    "fault": {
        "attr": 1152,
        "canTrigger": true,
        "code": "fault",
        "defaultRecommend": false,
        "editPermission": true,
        "executable": true,
        "extContent": "",
        "iconname": "icon-baojing",
        "id": 20,
        "mode": "ro",
        "name": "故障告警",
        "property": {
            "label": [
                "E1",
                "E3",
                "E4",
                "E0"
            ],
            "type": "bitmap",
            "maxlen": 4
        },
        "scope": "fault",
        "type": "obj"
    },
    "water_flow": {
        "attr": 1152,
        "canTrigger": true,
        "code": "water_flow",
        "defaultRecommend": false,
        "editPermission": true,
        "executable": true,
        "extContent": "",
        "iconname": "icon-dp_water",
        "id": 21,
        "mode": "ro",
        "name": "水流量",
        "property": {
            "unit": "GPM",
            "min": 0,
            "max": 100,
            "scale": 1,
            "step": 1,
            "type": "value"
        },
        "type": "obj"
    },
    "temp_set_f": {
        "attr": 1156,
        "canTrigger": true,
        "code": "temp_set_f",
        "defaultRecommend": false,
        "editPermission": true,
        "executable": true,
        "extContent": "",
        "iconname": "icon-dp_f",
        "id": 25,
        "mode": "rw",
        "name": "温度设置（℉）",
        "property": {
            "unit": "℉",
            "min": 86,
            "max": 140,
            "scale": 0,
            "step": 1,
            "type": "value"
        },
        "type": "obj"
    },
    "heating": {
        "attr": 0,
        "canTrigger": true,
        "code": "heating",
        "defaultRecommend": false,
        "editPermission": false,
        "executable": true,
        "extContent": "",
        "id": 101,
        "mode": "ro",
        "name": "加热",
        "property": {
            "type": "bool"
        },
        "type": "obj"
    },
    "flow": {
        "attr": 0,
        "canTrigger": true,
        "code": "flow",
        "defaultRecommend": false,
        "editPermission": false,
        "executable": true,
        "extContent": "",
        "id": 102,
        "mode": "ro",
        "name": "水流",
        "property": {
            "type": "bool"
        },
        "type": "obj"
    },
    "water_consumption": {
        "attr": 0,
        "canTrigger": true,
        "code": "water_consumption",
        "defaultRecommend": false,
        "editPermission": false,
        "executable": true,
        "extContent": "",
        "id": 103,
        "mode": "ro",
        "name": "耗水量",
        "property": {
            "unit": "G",
            "min": 0,
            "max": 2147483647,
            "scale": 0,
            "step": 1,
            "type": "value"
        },
        "type": "obj"
    },
    "consumption_swich": {
        "attr": 0,
        "canTrigger": true,
        "code": "consumption_swich",
        "defaultRecommend": false,
        "editPermission": false,
        "executable": true,
        "extContent": "",
        "id": 104,
        "mode": "wr",
        "name": "统计开关",
        "property": {
            "type": "bool"
        },
        "type": "obj"
    }
}
] as const;
