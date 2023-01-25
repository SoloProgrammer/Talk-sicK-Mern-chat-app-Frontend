export const scrollBottom = (elmByid,ScrollBehavoiur = "auto") => {
    let elm = document.getElementById(elmByid)
    // elm.style.scrollBehavior = "unset !important"
    elm?.scrollTo({ top: elm.scrollHeight,behavior: ScrollBehavoiur })
}