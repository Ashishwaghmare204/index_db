
import React from 'react'
import {ToastContainer,toast} from 'react-toastify'
const DB_NAME="coding_ott";
const VERSION=1

const Learning = () => {
  const dbConnect=()=>{
    return new Promise((resolve, reject) => {
      
      const req=indexedDB.open(DB_NAME,VERSION)
      req.onupgradeneeded =()=>{
        const db = req.result
     const payload = {
  keyPath: "id",
  autoIncrement: true
}
        db.createObjectStore("users",payload)
        db.createObjectStore("employee",payload)
        db.createObjectStore("salaries",payload)
         db.createObjectStore("payments",payload)
      }
      req.onsuccess=()=>resolve(req.result)
      req.onerror=()=>reject(req.error)
    })
  }
const storeData = async () => {
  try {
    const db = await dbConnect();

    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");

    const payload = {
      name: "Ashish",
      email: "ashish@gmail.com"
    };

    store.add(payload);

    transaction.oncomplete = () => {
      toast.success("Data stored successfully ✅");
    };

    transaction.onerror = () => {
      toast.error("Failed to store data ❌");
    };

  } catch (err) {
    toast.error(err.message);
  }
};
   const fetchData= async()=>{
   try{
      const db = await dbConnect();   // ✅ FIX
    const transaction=db.transaction("users","readonly")
    const req=transaction.objectStore("users").getAll()
    req.onsuccess=()=>{
       toast.success("data fetch successfully")
      console.log(req.result)
    }
    req.onerror=()=>{
      toast.error("fail to fetch data")
    }

   }
   catch(err){
    toast.error(err.message)
   }
  }
   const updateData=async()=>{
     try{
      const db = await dbConnect();   
    const transaction=db.transaction("users","readwrite")
    
    const store=transaction.objectStore("users")
    const req=store.get(8);
    req.onsuccess=()=>{
      const data=req.result
      if(!data){
        toast.error("failed to find data by id value")
      }
      console.log(req.result)

      
      const payload={
       ...data,
       name:"kartikAryan"
      }
      store.put(payload)
    }
transaction.oncomplete=()=>{
  toast.success("data updated")
}
transaction.onerror=()=>{
  toast.error("fail to update data")
}
   }
   catch(err){
    toast.error(err.message)
   }
  }
   const deleteData=()=>{
    alert()
  }
  return (
    <div className='p-16 flex gap-6'>
      <button onClick={storeData} className='bg-indigo-600 text-white font-medium px-8 py-2 rounded active:scale-80 transition duration-300'>store data</button>
      <button  onClick={fetchData} className='bg-rose-600 text-white font-medium px-8 py-2 rounded active:scale-80 transition duration-300'>fetch data</button>
      <button onClick={updateData} className='bg-amber-600 text-white font-medium px-8 py-2 rounded active:scale-80 transition duration-300'>update data</button>
      <button onClick={deleteData} className='bg-green-600 text-white font-medium px-8 py-2 rounded active:scale-80 transition duration-300'>delete data</button>
   <ToastContainer />
    </div>
  )
}

export default Learning