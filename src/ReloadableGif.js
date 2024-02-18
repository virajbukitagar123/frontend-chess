import { useState } from "react";

export default function ReloadableGif(props) {
    const URL = "http://localhost:8888/"
    const [gif] = useState(URL + props.opening + "/" + props.moveNum);
    const [loaded, setLoaded] = useState(URL + props.opening + "/" + props.moveNum);
  
    const reloadGif = () => {
      setLoaded('');
      setTimeout(() => {
        setLoaded(gif);
      }, 0);
    };
  
    return (
        <img src={loaded} alt="No Gif Found" onClick={reloadGif} />
    );
  }