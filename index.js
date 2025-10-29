const fs = require("fs");

// Step 1: Read JSON file

const data = JSON.parse(fs.readFileSync("./roots.json", "utf8"));
// const data = JSON.parse(fs.readFileSync("./roots2.json", "utf8"));

// Step 2: Extract n and k
const n = data.keys.n;
const k = data.keys.k;

// Step 3: Decode (x, y) pairs
const points = [];
for (let key in data) {
  if (key !== "keys") {
    const base = parseInt(data[key].base);
    const valueStr = data[key].value;
    const y = parseInt(valueStr, base);
    const x = parseInt(key);
    points.push({ x, y });
  }
}

// Use only first 3 points to form 3 equations
const selectedPoints = points.slice(0, 3);

if (selectedPoints.length < 3) {
  console.log("Need at least 3 points to solve for a, b, c.");
  process.exit(1);
}

// Step 4: Extract values
const [p1, p2, p3] = selectedPoints;

// Equations:
// y = a*x^n + b*x^(n-1) + c
const A = [
  [Math.pow(p1.x, n), Math.pow(p1.x, n - 1), 1],
  [Math.pow(p2.x, n), Math.pow(p2.x, n - 1), 1],
  [Math.pow(p3.x, n), Math.pow(p3.x, n - 1), 1]
];
const Y = [p1.y, p2.y, p3.y];

// Step 5: Solve linear equations (A * [a, b, c] = Y)
function solve3x3(A, Y) {
  const det = (A[0][0]*(A[1][1]*A[2][2] - A[2][1]*A[1][2])
             - A[0][1]*(A[1][0]*A[2][2] - A[2][0]*A[1][2])
             + A[0][2]*(A[1][0]*A[2][1] - A[2][0]*A[1][1]));

  if (det === 0) throw new Error("Determinant is zero, no unique solution.");

  const invDet = 1 / det;

  // Use Cramer’s rule
  const detA = (Y[0]*(A[1][1]*A[2][2] - A[2][1]*A[1][2])
              - A[0][1]*(Y[1]*A[2][2] - Y[2]*A[1][2])
              + A[0][2]*(Y[1]*A[2][1] - Y[2]*A[1][1]));

  const detB = (A[0][0]*(Y[1]*A[2][2] - Y[2]*A[1][2])
              - Y[0]*(A[1][0]*A[2][2] - A[2][0]*A[1][2])
              + A[0][2]*(A[1][0]*Y[2] - A[2][0]*Y[1]));

  const detC = (A[0][0]*(A[1][1]*Y[2] - A[2][1]*Y[1])
              - A[0][1]*(A[1][0]*Y[2] - A[2][0]*Y[1])
              + Y[0]*(A[1][0]*A[2][1] - A[2][0]*A[1][1]));

  const a = detA / det;
  const b = detB / det;
  const c = detC / det;

  return { a, b, c };
}

const { a, b, c } = solve3x3(A, Y);

// Step 6: Output
console.log("Decoded Points:", selectedPoints);
console.log(`a = ${a}, b = ${b}, c = ${c}`);
console.log(`Constant term (c): ${c}`);
