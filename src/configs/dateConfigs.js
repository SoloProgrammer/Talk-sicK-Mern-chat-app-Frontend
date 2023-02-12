export const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// export const Fullmonth= ["January","February","March","April","May","June","July",
//             "August","September","October","November","December"];

// Dynamically generating array of FullMonth same as `Commented above` :- Op Javascript...............!
export const Fullmonth = Array.from({length: 12}, (_, i) => {
   return new Date(null, i + 1, null).toLocaleDateString("en", {month: "long"});
})

export const getFormmatedTime = (date) => {
    return String(date.getHours() % 12 === 0 ? "12" : date.getHours() % 12 < 10 ? "0" + date.getHours() % 12 : date.getHours() % 12) + ":" + String(date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes()) + " " + String(date.getHours() >= 12 ? "pm" : "am")
}

export const getFormmatedDate = (date) => {
    return String(date.getDate()) + "/" + String(month[date.getMonth()]) + "/" + String(date.getFullYear())
}