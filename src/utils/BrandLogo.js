import React from 'react'

function BrandLogo({color = "black"}) {
  return (
        <div style={{color:color,margin:"0"}} className='brand_logo'>
            <div className="brandpic">
                <img src="https://cdn-icons-png.flaticon.com/512/3845/3845696.png" alt="Talk-o-Meter"  />
            </div>
            Talk-o-Meter
        </div>
  )
}

export default BrandLogo
