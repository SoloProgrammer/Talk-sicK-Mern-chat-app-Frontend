export const imageActionBtns = [
    { imgCopy: "Download", src: 'https://cdn-icons-png.flaticon.com/512/3580/3580085.png' },
    { imgCopy: "Zoom-in", src: 'https://cdn-icons-png.flaticon.com/512/545/545651.png' },
    { imgCopy: "Zoom-out", src: 'https://cdn-icons-png.flaticon.com/512/74/74158.png' },
]

export const defaultPic = "https://res.cloudinary.com/dvzjzf36i/image/upload/v1679814483/wxrvucwq93ovrswfpsk3.png"

export const defaultGrpPic = "https://tse2.mm.bing.net/th?id=OIP.OtLqKEL4eIvyiNSJZ4pT-wHaHa&pid=Api&P=0"

export const sendBtn = "https://cdn-icons-png.flaticon.com/512/3059/3059413.png"

export const sendBtnActive = "https://cdn-icons-png.flaticon.com/512/3060/3060014.png"

export const emojiIcon = "https://cdn-icons-png.flaticon.com/512/9320/9320978.png"

export const LogoutIcon = "https://cdn-icons-png.flaticon.com/512/4034/4034229.png"

export const seenCheckMark = "https://cdn-icons-png.flaticon.com/512/3550/3550119.png"

export const unSeenCheckMark = "https://cdn-icons-png.flaticon.com/512/5410/5410422.png"

export const BrandImg = "https://cdn-icons-png.flaticon.com/512/3845/3845696.png"

export const archiveImg = "https://cdn-icons-png.flaticon.com/512/8138/8138776.png"

export const unArchiveImg = "https://cdn-icons-png.flaticon.com/512/5774/5774826.png"

export const downArrowCyan = "https://cdn-icons-png.flaticon.com/512/137/137519.png"

export const leaveGrpImg = "https://cdn-icons-png.flaticon.com/512/8914/8914318.png"

export const trashCanIcon = "https://cdn-icons-png.flaticon.com/512/5165/5165608.png"

export const pinFilledIcon = "https://cdn-icons-png.flaticon.com/512/1274/1274749.png"

export const pinOutlineIcon = "https://cdn-icons-png.flaticon.com/512/1274/1274786.png"

export const bellDividedIcon = "https://cdn-icons-png.flaticon.com/512/4175/4175297.png"

export const bellIcon = "https://cdn-icons-png.flaticon.com/512/3239/3239952.png"


export let zoomCount = 0.5

window.addEventListener('click', () => {
    zoomCount = .5
})

export function zoomInImage() {
    if (zoomCount >= 3.5) return
    let img = document.querySelector('.messageImage')

    if (zoomCount === 1) zoomCount += .5
    else zoomCount += 1

    img.style.transform = `scale(${zoomCount})`
}

export function zoomOutImage() {
    if (zoomCount <= 1) return
    let img = document.querySelector('.messageImage')

    if (zoomCount === 1.5) zoomCount -= .5
    else zoomCount -= 1

    img.style.transform = `scale(${zoomCount})`
}

export function downloadImage(url) {
    window.saveAs(url, 'Image')
}