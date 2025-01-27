function calculateDerivative(f, x) {
    const h = 1e-5; // A small value for calculating the derivative
    return (f(x + h) - f(x - h)) / (2 * h);
}

function getDerivativeFunction(f) {
    return function(x) {
        return calculateDerivative(f, x);
    };
}

export { calculateDerivative, getDerivativeFunction };