export const scrollBottom = (elmByid, ScrollBehavoiur = "auto") => {
    let elm = document.getElementById(elmByid)
    elm?.scrollTo({ top: elm.scrollHeight, behavior: ScrollBehavoiur })
}

export const scrollTop = (elmByid, ScrollBehavoiur = "auto") => {
    let elm = document.getElementById(elmByid)
    elm?.scrollTo({ top: -elm.scrollHeight, behavior: ScrollBehavoiur })
}

export const scrollIntoView = (elm, scrollTo) => {
    // console.log(scrollTo);
    elm.scrollTop = scrollTo
} 