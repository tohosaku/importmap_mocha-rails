var until=async r=>{try{const t=await r().catch((r=>{throw r}));return{error:null,data:t}}catch(r){return{error:r,data:null}}};export{until};

