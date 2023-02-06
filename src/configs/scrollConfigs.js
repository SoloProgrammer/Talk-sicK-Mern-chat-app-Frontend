export const scrollBottom = (elmByid,ScrollBehavoiur = "auto") => {
    let elm = document.getElementById(elmByid)
    elm?.scrollTo({ top: elm.scrollHeight,behavior: ScrollBehavoiur })
}