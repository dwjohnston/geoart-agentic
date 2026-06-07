import { describe, it, expect } from 'bun:test';
import { generateEnumControls } from './generate-enum-controls';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const minimalSchema: any = {
    definitions: {
        waveTypeEnumValue: {
            title: "Wave Type Enum Value",
            type: "object",
            properties: { v: { type: "string", enum: ["sine", "square"] } },
        },
        numberValue: {
            title: "Number Value",
            type: "object",
            properties: { v: { type: "number" } },
        },
    },
};

describe('generateEnumControls', () => {
    it('generates one entry per EnumValue kind, skipping non-enum kinds', () => {
        const result = generateEnumControls(minimalSchema);
        expect(Object.keys(result.definitions)).toEqual(['waveTypeSelector']);
    });

    it('generates correct structure for a selector entry', () => {
        const result = generateEnumControls(minimalSchema);
        expect(result.definitions['waveTypeSelector']).toMatchInlineSnapshot(`
          {
            "additionalProperties": false,
            "description": "Dropdown selector for wave type",
            "properties": {
              "id": {
                "title": "ID",
                "type": "string",
              },
              "params": {
                "additionalProperties": false,
                "properties": {
                  "label": {
                    "$ref": "value-kinds.schema.json#/definitions/stringValue",
                  },
                  "value": {
                    "$ref": "value-kinds.schema.json#/definitions/waveTypeEnumValue",
                  },
                },
                "type": "object",
              },
              "type": {
                "enum": [
                  "waveTypeSelector",
                ],
                "title": "Type",
                "type": "string",
              },
            },
            "required": [
              "id",
              "type",
              "params",
            ],
            "title": "Wave Type Selector Control Node",
            "type": "object",
            "x-outputs": [
              {
                "name": "value",
                "valueType": "waveTypeEnumValue",
              },
            ],
          }
        `);
    });
});
