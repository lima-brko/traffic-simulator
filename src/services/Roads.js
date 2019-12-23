const graphPoints = [
  {
    id: 'row1.start.even',
    x: -600,
    y: -397,
    edges: ['row1.col1.even']
  },
  {
    id: 'row1.col1.even',
    x: 0,
    y: -397,
    edges: ['row1.start.even', 'col1.row1.even', 'row1.end.even']
  },
  {
    id: 'row1.end.even',
    x: 0,
    y: -397,
    edges: ['row1.col1.even']
  },

  {
    id: 'row1.start.odd',
    x: 600,
    y: -440,
    edges: ['row1.col1.odd']
  },
  {
    id: 'row1.col1.odd',
    x: 0,
    y: -440,
    edges: ['row1.start.odd', 'col1.row1.odd', 'row1.end.odd']
  },
  {
    id: 'row1.end.odd',
    x: -600,
    y: -440,
    edges: ['row1.col1.odd']
  }
];

const total = 4;
const axes = ['row', 'col'];
for(let i = 0; i < total; i++) {
  axes.forEach((axis, axesI) => {
    const oppositeAxis = axes[axesI === 0 ? 1 : 0];

    graphPoints.push({
      id: `${axis}${i}.start.`
    });

    for(let j = 0; j < total; j++) {
      graphPoints.push({
        id: `${axis}${i}.${oppositeAxis}`
      });
    }
  });
}

function getPoint(id) {
  return graphPoints.find((point) => point.id === id);
}

const roads = [
  {
    name: 'Row-1',
    ways: {
      even: [
        {
          name: 'row2_even',
          points: [
            getPoint('row1.start.even'),
            getPoint('row1.col1.even'),
            getPoint('row1.end.even')
          ]
        }
      ],
      odd: [
        {
          name: 'row2_odd',
          points: [
            getPoint('row1.end.odd'),
            getPoint('row1.col1.odd'),
            getPoint('row1.start.odd')
          ]
        }
      ]
    }
  }
];

export default roads;
