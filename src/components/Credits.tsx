const Credits = () => {
  const handleClick = () => {
    window.open('https://asylum.fr', '_blank');
  };

  return (
    <div
      onClick={handleClick}
      className="
        group
        absolute bottom-0 right-0 
        flex items-center justify-evenly 
        w-[6vw] h-[35px] 
        rounded-tl-[14px] 
        bg-white text-[12px] font-bold font-barlow
        p-[2px]
        transition-all duration-300
        hover:bg-red-600 hover:text-white
        cursor-pointer
        max-[992px]:w-fit max-[992px]:pl-[5px]
        z-[9999]
      "
    >
      {/* Titre "Powered by" visible seulement sur desktop */}
      <div className="max-[992px]:hidden">Powered by</div>

      {/* Logo Asylum */}
      <div className="h-[30px] max-[992px]:h-[10px]">
        <img
          src="/logo_asy.png"
          alt="Asylum Logo"
          className="
            w-full h-full 
            transition-all duration-300 
            group-hover:brightness-0 group-hover:invert
          "
        />
      </div>
    </div>
  );
};

export default Credits;
