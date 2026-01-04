export default function truncateSmart(value: string | number) {
    if (value === null || value === undefined || value === "") return value;

    const num = Number(value);
    if (isNaN(num)) return value;

    const absNum = Math.abs(num);

    // Convert to string to inspect decimals safely
    const [, decimals = ""] = absNum.toString().split(".");

    let decimalsToKeep = 2;

    // Case: number < 1 and first decimal digit is 0
    if (absNum < 1 && decimals[0] === "0") {
        decimalsToKeep = 3;
    }

    const factor = Math.pow(10, decimalsToKeep);
    return Number(Math.trunc(num * factor) / factor);
}
