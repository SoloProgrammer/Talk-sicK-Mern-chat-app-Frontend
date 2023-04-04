export const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// export const Fullmonth= ["January","February","March","April","May","June","July",
//             "August","September","October","November","December"];

// Dynamically generating array of FullMonth same as `Commented above` :- Op Javascript...............!
export const Fullmonth = Array.from({ length: 12 }, (_, i) => {
    return new Date(null, i + 1, null).toLocaleDateString("en", { month: "long" });
})

export const getFormmatedTime = (date) => {

    const hours = date.getHours();
    const min = date.getMinutes();
    const formattedTime = `${hours % 12 === 0 ? "12" : hours % 12 < 10 ? "0" + hours % 12 : hours % 12}:${min < 10 ? "0" + min : min} ${hours >= 12 ? "pm" : "am"}`

    return formattedTime;
}

export const getFormmatedDate = (date) => {
    return `${date.getDate()}/${month[date.getMonth()]}/${date.getFullYear()}`
}