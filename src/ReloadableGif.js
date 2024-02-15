import { useState } from "react";

export default function ReloadableGif() {
    const [gif] = useState('1.gif');
    const [loaded, setLoaded] = useState('1.gif');
  
    const reloadGif = () => {
      setLoaded('');
      setTimeout(() => {
        setLoaded(gif);
      }, 0);
    };
  
    return (
      <div>
        <img style={{height: 200, width: 200}} src={loaded} alt="Gif" onClick={reloadGif} />
      </div>
    );
  }