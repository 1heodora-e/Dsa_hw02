const fs = require('fs');

class SparseMatrix {
    constructor(filePath = null) {
        this.rows = 0;
        this.cols = 0;
        this.data = new Map();
        if (filePath) {
            this.loadFromFile(filePath);
        }
    }

    loadFromFile(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf-8').trim();
        const lines = fileContent.split('\n');
        lines.forEach((line, index) => {
            if (line.trim() === '') return;
            line = line.trim();
            if (index === 0) {
                this.rows = parseInt(line.split('=')[1]);
            } else if (index === 1) {
                this.cols = parseInt(line.split('=')[1]);
            } else {
                const match = line.match(/^\((\d+),\s*(\d+),\s*(-?\d+)\)$/);
                if (!match) {
                    throw new Error('Input file has wrong format');
                }
                const [_, row, col, value] = match.map(Number);
                this.setElement(row, col, value);
            }
        });
    }

    getElement(row, col) {
        return this.data.has(`${row},${col}`) ? this.data.get(`${row},${col}`) : 0;
    }

    setElement(row, col, value) {
        if (value === 0) {
            this.data.delete(`${row},${col}`);
        } else {
            this.data.set(`${row},${col}`, value);
        }
    }

    // Addition that works even if dimensions don't match
    add(matrix) {
        const maxRows = Math.max(this.rows, matrix.rows);
        const maxCols = Math.max(this.cols, matrix.cols);

        const result = new SparseMatrix();
        result.rows = maxRows;
        result.cols = maxCols;

        // Add elements from matrix A
        for (const [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, value + matrix.getElement(row, col));
        }

        // Add remaining elements from matrix B (those not present in A)
        for (const [key, value] of matrix.data) {
            const [row, col] = key.split(',').map(Number);
            if (!this.data.has(key)) {
                result.setElement(row, col, value);
            }
        }

        return result;
    }

    // Subtraction that works even if dimensions don't match
    subtract(matrix) {
        const maxRows = Math.max(this.rows, matrix.rows);
        const maxCols = Math.max(this.cols, matrix.cols);

        const result = new SparseMatrix();
        result.rows = maxRows;
        result.cols = maxCols;

        // Subtract elements from matrix A
        for (const [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, value - matrix.getElement(row, col));
        }

        // Subtract remaining elements from matrix B (those not present in A)
        for (const [key, value] of matrix.data) {
            const [row, col] = key.split(',').map(Number);
            if (!this.data.has(key)) {
                result.setElement(row, col, -value);
            }
        }

        return result;
    }

    // Multiplication logic remains unchanged
    multiply(matrix) {
        if (this.cols !== matrix.rows) {
            throw new Error('Matrix multiplication not possible: columns of A must match rows of B');
        }
        const result = new SparseMatrix();
        result.rows = this.rows;
        result.cols = matrix.cols;

        for (const [keyA, valueA] of this.data) {
            const [rowA, colA] = keyA.split(',').map(Number);
            for (let colB = 0; colB < matrix.cols; colB++) {
                const valueB = matrix.getElement(colA, colB);
                if (valueB !== 0) {
                    const currentValue = result.getElement(rowA, colB);
                    result.setElement(rowA, colB, currentValue + valueA * valueB);
                }
            }
        }
        return result;
    }

    print() {
        for (let i = 0; i < this.rows; i++) {
            let row = '';
            for (let j = 0; j < this.cols; j++) {
                row += this.getElement(i, j) + ' ';
            }
            console.log(row.trim());
        }
    }

    saveToFile(filePath) {
        const lines = [];
        lines.push(`rows=${this.rows}`);
        lines.push(`cols=${this.cols}`);
        for (const [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);
            lines.push(`(${row}, ${col}, ${value})`);
        }
        fs.writeFileSync(filePath, lines.join('\n'));
    }
}

function performOperation(operation, file1, file2) {
    const matrixA = new SparseMatrix(file1);
    const matrixB = new SparseMatrix(file2);

    // Log matrix dimensions for debugging
    console.log(`Matrix A: ${matrixA.rows} x ${matrixA.cols}`);
    console.log(`Matrix B: ${matrixB.rows} x ${matrixB.cols}`);

    let resultMatrix;
    if (operation === 'add') {
        resultMatrix = matrixA.add(matrixB);
    } else if (operation === 'subtract') {
        resultMatrix = matrixA.subtract(matrixB);
    } else if (operation === 'multiply') {
        resultMatrix = matrixA.multiply(matrixB);
    } else {
        throw new Error('Invalid operation');
    }

    resultMatrix.saveToFile(`C:/Users/hp/Desktop/Dsa_hw02/sparse_matrix/result.txt`);
    console.log(`Result saved to /dsa/sparse_matrix/result.txt`);
}

// Example usage
const operation = process.argv[2]; // 'add', 'subtract', 'multiply'
const file1 = 'C:/Users/hp/Desktop/Dsa_hw02/sparse_matrix/sample_inputs/easy_sample_01_2.txt';
const file2 = 'C:/Users/hp/Desktop/Dsa_hw02/sparse_matrix/sample_inputs/easy_sample_01_3.txt';

try {
    performOperation(operation, file1, file2);
} catch (err) {
    console.error(err.message);
}
