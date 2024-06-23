export function getDateString(date: Date = new Date()) {
    return date.toISOString().split("T")[0];
}

export function todayHHmmToTimestamp(timeInHHmm: string): number {
    const timeParts = timeInHHmm.split(":");
    if (timeParts.length !== 2) {
        throw new Error("invalid time format, required 24-hours HH:mm");
    }
    const hoursNum = Number(timeParts[0]);
    const minNum = Number(timeParts[1]);
    if (hoursNum >= 0 && hoursNum < 24 && minNum >= 0 && minNum < 60) {
        const today = new Date();
        today.setHours(hoursNum, minNum);
        return today.getTime();
    }
    throw new Error("invalid hours/minutes");
}