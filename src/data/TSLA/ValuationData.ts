export const valuationTable = {
  headers: ['Unidades', 'USD $', 'Bear', 'Basis', 'Bull'],
  rows: [
    ["TSLA", "GRF5Y\GRL5Y", "20", "25", "30"],
    ["Bear", "20", 118.91, 142.95, 171.08],
    ["Basis", "25", 145.07, 174.55, 209.05],
    ["Bull", "30", 175.7, 211.56, 253.54],
  ],
  quantities: {
    "Initial FCF": 2,
    "FCF multiple": 50,
    "Disccount Rate": 15,
    "Margin of safety": 25,
  }
};
