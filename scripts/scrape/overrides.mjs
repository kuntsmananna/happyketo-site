// Hand-structured recipes whose original layout mixes ingredients and steps too freely to parse.
// Wording follows the original posts; only the order/grouping is tidied.
// With an override, the post body keeps only its media (images/videos); the text lives here.

const dough = {
  ingredients: [
    { title: 'יבשים', items: ['2 כוסות ק. שקדים', 'חצי כף א. אפייה', '3 כפות ממתיק (רצוי טחון לאבקה)', 'חצי כפית קאסטן גאם'] },
    { title: 'רטובים', items: ['1 כוס מוצרלה מגורדת', '2 כפות גבינת שמנת', '1 כפית תמצית וניל', 'ביצה'] },
  ],
  steps: [
    'יבשים: לערבב הכל ביחד.',
    'רטובים: להמיס את המוצרלה יחד עם 2 כפות גבינת שמנת, להוסיף 1 כפית תמצית וניל וביצה.',
    'לאחד את 2 התערובות ביחד, ללוש עד לאיחוד ולשים במקפיא לעשר דק׳.',
  ],
};

/** @type {Record<string, { ingredients: {title?: string, items: string[]}[], instructions: {title?: string, steps: string[]}[] }>} */
export const overrides = {
  cinnabonrecipe: {
    ingredients: [
      ...dough.ingredients,
      { title: 'מלית קינמון', items: ['2 כפות שטוחות של קינמון', '3 כפות ממתיק', '40 גרם חמאה', '1 כפית תמצית וניל'] },
      { title: 'רוטב סוכר', items: ['2 כפות ממתיק', '2 כפות גבינת שמנת', '3 כפות מים'] },
    ],
    instructions: [
      { title: 'בצק', steps: dough.steps },
      {
        title: 'מלית והרכבה',
        steps: [
          'במחבת קטנה להמיס את מרכיבי המלית.',
          'להוציא בצק מהמקפיא ולרדד דק בין 2 ניירות אפייה.',
          'למרוח את המלית ולגלגל בעדינות.',
          'לחתוך לעיגולים ולאפות 180 מעלות כ-15 דק׳ (או עד שמזהיב יפה).',
        ],
      },
      { title: 'רוטב סוכר', steps: ['במחבת קטנה להמיס את מרכיבי הרוטב.', 'לצקת את הרוטב סוכר על הקינמונים.'] },
    ],
  },
  'שבלולי-שוקולד': {
    ingredients: [...dough.ingredients, { title: 'מלית שוקולד', items: ['ממרח סוויטנגו שוקולד לוז'] }],
    instructions: [{ title: 'בצק', steps: dough.steps }],
  },
};
