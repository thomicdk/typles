type JSONDocument = { [x: string]: JSONValue };

type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;

export type StringType = { type: 'string' };
export type NumberType = { type: 'number' };
export type BooleanType = { type: 'boolean' };
export type NullType = { type: 'null' };

export type ObjectLiteralType = {
    type: 'object';
    properties: ObjectProperty[];
}
export type ArrayType = { type: 'array', items: Type };


export type SimpleType = StringType | NumberType | BooleanType | NullType;
export type ComplexType = ObjectLiteralType | ArrayType;

export type Type = SimpleType | ComplexType;

export type ObjectProperty =  {
    name: string;
    value: SimpleType | ComplexType;
}

export type Document = ObjectLiteralType;


export function parse(json: JSONDocument): Document {
    if (typeof json !== 'object') {
        throw new Error(`'json' must be an object/document. Got: ${typeof json}`);
    } 
    return parseObjectLiteral(json);
}

export function parseObjectLiteral(value: { [x: string]: JSONValue }): Document {
    return {
        type: 'object',
        properties: Object.entries(value).map(([name, value]) => parseObjectProperty(name, value))
    };
}

function parseObjectProperty(name: string, value: JSONValue): ObjectProperty {
    const valueType = parseValue(value);
    return {
        name,
        value: valueType,
    };
}

function parseValue(value: JSONValue): Type {
    if (Array.isArray(value)) {
        return { type: 'array', items: parseValue(value[0]) };
    } else if (value === null) {
        return { type: 'null' };
    } else if (typeof value === 'object') {
        return parseObjectLiteral(value);
    } else if (typeof value === 'string') {
        return { type: 'string' };
    } else if (typeof value === 'number') {
        return { type: 'number' };
    } else if (typeof value === 'boolean') {
        return { type: 'boolean' };
    }
    throw new Error('Data type not supported: ' + typeof value);
}
