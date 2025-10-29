const fs = require('fs');
const path = require('path');

function parseBigIntBase(valueStr, base) {
  const baseN = BigInt(base);
  let result = 0n;
  for (let i = 0; i < valueStr.length; i++) {
    const char = valueStr[i].toLowerCase();
    let digit;
    if (char >= '0' && char <= '9') digit = BigInt(char.charCodeAt(0) - 48);
    else if (char >= 'a' && char <= 'z') digit = BigInt(char.charCodeAt(0) - 87);
    else throw new Error(`Invalid character: ${char}`);
    if (digit >= baseN) throw new Error(`Digit ${char} out of range for base ${base}`);
    result = result * baseN + digit;
  }
  return result;
}

function findConstantTerm(data) {
  const k = data.keys.k;
  const points = [];
  let count = 0;

  for (const key in data) {
    if (key === 'keys') continue;
    if (count >= k) break;
    const x = BigInt(key);
    const y = parseBigIntBase(data[key].value, data[key].base);
    points.push({ x, y });
    count++;
  }

  let p_at_zero = 0n;
  for (let j = 0; j < k; j++) {
    const y_j = points[j].y;
    const x_j = points[j].x;
    let numerator = 1n;
    let denominator = 1n;
    for (let i = 0; i < k; i++) {
      if (i === j) continue;
      numerator *= points[i].x;
      denominator *= (points[i].x - x_j);
    }
    const term = y_j * numerator;
    p_at_zero += term / denominator;
  }

  return p_at_zero;
}

/* ------------------- Main ------------------- */
try {
  const inputFile = process.argv[2] || path.join(__dirname, 'input.json');
  const fileContent = fs.readFileSync(inputFile, 'utf-8');
  const data = JSON.parse(fileContent);

  if (!Array.isArray(data.testCases)) {
    throw new Error("Invalid JSON structure: 'testCases' must be an array");
  }

  console.log("\n🔹 Hashira Placements Polynomial Solver 🔹\n");

  data.testCases.forEach((testCase, idx) => {
    console.log(`--- Test Case ${idx + 1} ---`);
    const result = findConstantTerm(testCase);
    console.log(`🎯 Constant term (P(0)) = ${result}\n`);
  });

} catch (err) {
  console.error("❌ Error reading or parsing input.json:", err.message);
}
