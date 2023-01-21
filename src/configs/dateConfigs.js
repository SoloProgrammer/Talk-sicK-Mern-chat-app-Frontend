export const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getFormmatedTime = (date) => {
    return String(date.getHours() % 12 === 0 ? "12" : date.getHours() % 12 < 10 ? "0" + date.getHours() % 12 : date.getHours() % 12) + ":" + String(date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes()) + " " + String(date.getHours() >= 12 ? "pm" : "am")
}

export const getFormmatedDate = (date) => {
    return String(date.getDate()) + "/" + String(month[date.getMonth()]) + "/" + String(date.getFullYear())
}