const placeholderBegin = '{{'
const placeholderEnd = '}}'

const jsonTemplate = {
  array: [
    {
      type: 'foo',
      config: `${placeholderBegin}config${placeholderEnd}`,
    },
    {
      type: 'bar',
      arrConfig: `${placeholderBegin}arrConfig${placeholderEnd}`,
    },
  ],
};

const jsonTemplateContext = {
  config: {
    test1: 'value1',
    test2: 'value2',
  },
  arrConfig: [
    {
      test3: {
        key1: 'val1',
      },
    },
    {
      test4: {
        key1: 'val1',
      },
    },
  ],
};

const expectedResult = {
  array: [
    {
      type: 'foo',
      config: {
        test1: 'value1',
        test2: 'value2',
      },
    },
    {
      type: 'bar',
      arrConfig: [
        {
          test3: {
            key1: 'val1',
          },
        },
        {
          test4: {
            key1: 'val1',
          },
        },
      ],
    },
  ],
};

const stringifyReplacer = (key, val) => {
  if (typeof val === 'string' && val.startsWith(placeholderBegin) && val.endsWith(placeholderEnd)) {
    return jsonTemplateContext[val.slice(placeholderBegin.length, -placeholderEnd.length)]
  }
  return val;
}

const result = JSON.parse(JSON.stringify(jsonTemplate, stringifyReplacer));

console.log(`stringify replacer result: ${JSON.stringify(expectedResult) === JSON.stringify(result) ? 'OK!' : 'OOOH, NOOO!'}`);