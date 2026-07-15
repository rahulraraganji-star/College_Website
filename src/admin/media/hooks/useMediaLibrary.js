import { useEffect, useState } from "react";
import { mediaService } from "../services/mediaService";

const useMediaLibrary = () => {

  const [media, setMedia] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadMedia = async () => {

    try {

      const data = await mediaService.getAll();

      setMedia(data);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadMedia();

  }, []);

  return {

    media,

    loading,

    reload: loadMedia,

  };

};

export default useMediaLibrary;