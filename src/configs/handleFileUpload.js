export const handleFileUpload = async (e, setLoading, showToast) => {
    let pics = e.target.files[0]

    if (pics === undefined) {
        showToast("Not Selected", "Please select an Image file", "warning", 3000)
        return null
    }
    if (pics.type === 'image/jpeg' || pics.type === 'image/png' || pics.type === 'image/jpg') {
        setLoading(true)
        const data = new FormData();
        data.append('file', pics);
        data.append('upload_preset', "Talk-o-Meter");
        data.append('cloud_name', "dvzjzf36i");

        const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dvzjzf36i/image/upload"
        let config = {
            method: "POST",
            body: data
        }
        try {
            let res = await fetch(CLOUDINARY_URL, config)
            let json = await res.json();
            setLoading(false);

            return json.url.toString()
        } catch (error) {
            setLoading(false)
            return showToast("Seems some suspicious*", "Some error occured try again later", "error", 3000)
        }
    }
    else {
        return showToast("*Not accepted", "Please select an Image file", "warning", 3000)
    }

}