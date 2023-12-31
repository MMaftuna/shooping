// import logo from "./logo.svg";
import "./App.css";
import Header from "./component/Header";
import { Outlet } from "react-router-dom";
import  { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { setDataProduct } from "./redux/productSlide";
import { useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch()
  
  // const productData = useSelector((state)=>state.product)
 



  useEffect(()=>{
    (async()=>{
      try {
        const res = await fetch(`http://localhost:8989/product`)
        const resData = await res.json()
        dispatch(setDataProduct(resData))
      } catch (error) {
        console.log(error)
      }
    })();
  })
  
  return (
    <>
      <Toaster />
      <div>
        <Header />
        <main className="pt-16 bg-slate-100 min-h-[calc(100vh)]">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
