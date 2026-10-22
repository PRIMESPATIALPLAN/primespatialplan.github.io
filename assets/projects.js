/* Prime Spatial Plan — project data.
   To add a real project: put its images in images/<slug>/ and add an entry to PROJECTS below
   (newest first). Remove the sample entries once real projects exist.
   Fields: slug, sample (true only for placeholders), type (one of TYPES ids), year, status,
   title/location/text {mn,en}, meta: [{label:{mn,en}, value:{mn,en}}],
   images: [{src, contain (true for drawings), b:{mn,en} short label, cap:{mn,en}}] — first image is the cover. */

window.TYPES = [
  {id:'house',      mn:'Амины орон сууц',      en:'Private houses'},
  {id:'townhouse',  mn:'Таунхаус',             en:'Townhouses'},
  {id:'apartment',  mn:'Орон сууцны барилга',  en:'Apartment buildings'},
  {id:'renovation', mn:'Засвар, өргөтгөл',     en:'Renovation'},
  {id:'interior',   mn:'Интерьер',             en:'Interiors'},
  {id:'planning',   mn:'Төлөвлөлт',            en:'Planning'}
];

window.STATUS = {
  sample:   {mn:'Жишээ зураг',      en:'Sample drawing'},
  design:   {mn:'Зураг төсөл',      en:'In design'},
  building: {mn:'Баригдаж байна',   en:'Under construction'},
  done:     {mn:'Ашиглалтад орсон', en:'Completed'}
};

(function(){
  var D = {
    plan:   {src:'images/sample/plan.svg',      contain:true, b:{mn:'План —',     en:'Plan —'},     cap:{mn:'Функциональ төлөвлөлт: өрөө бүрийн талбай, хэмжээс, тэнхлэгийг нэг дор тусгана.', en:'Functional layout showing the area, dimensions and grid axes of every room.'}},
    elev:   {src:'images/sample/elevation.svg', contain:true, b:{mn:'Фасад —',    en:'Façade —'},   cap:{mn:'Барилгын гадаад төрх, цонхны хэмнэл, давхрын түвшний тэмдэглэгээ.', en:'The building’s exterior, window rhythm and floor level marks.'}},
    sect:   {src:'images/sample/section.svg',   contain:true, b:{mn:'Зүсэлт —',   en:'Section —'},  cap:{mn:'Давхар хоорондын өндөр, хучилт, суурь, дээврийн дулаалгын шийдэл.', en:'Floor heights, slabs, foundations and roof insulation.'}},
    site:   {src:'images/sample/site.svg',      contain:true, b:{mn:'Байршил —',  en:'Site —'},     cap:{mn:'Газрын нэгж талбар дээрх барилгын байрлал, орц гарц, машины зам, ногоон байгууламж.', en:'Building placement on the plot, entrances, driveway and landscaping.'}}
  };
  var UB = {mn:'Улаанбаатар, Монгол', en:'Ulaanbaatar, Mongolia'};

  window.PROJECTS = [
    {
      slug:'sample-house', sample:true, type:'house', status:'sample',
      title:{mn:'Хоёр давхар амины орон сууц', en:'Two-storey private house'}, location:UB,
      text:{mn:'Нэг, хоёр давхар амины сууцыг Монголын уур амьсгал, гэр бүлийн хэрэгцээнд тохируулан эскизээс ажлын зураг хүртэл зураглана. Энэ хуудас нь бидний гаргадаг зургийн жишээг харуулна.',
            en:'We design one- and two-storey houses for the Mongolian climate and your family’s needs, from sketch to working drawings. This page shows examples of the drawings we produce.'},
      meta:[{label:{mn:'Талбай',en:'Area'}, value:{mn:'≈ 180 м²',en:'≈ 180 m²'}},{label:{mn:'Давхар',en:'Storeys'}, value:{mn:'2',en:'2'}}],
      images:[D.plan, D.elev, D.sect, D.site]
    },
    {
      slug:'sample-townhouse', sample:true, type:'townhouse', status:'sample',
      title:{mn:'Таунхаус', en:'Townhouse'}, location:UB,
      text:{mn:'Хосолсон болон эгнээ байшингийн фасад, төлөвлөлтийг айл бүрийн хувийн орон зай, нарны гэрлийг хамгийн сайн ашиглахаар шийднэ.',
            en:'Façades and layouts for semi-detached and terraced houses that give every household privacy and the most daylight.'},
      meta:[{label:{mn:'Давхар',en:'Storeys'}, value:{mn:'2',en:'2'}}],
      images:[D.elev, D.plan, D.sect]
    },
    {
      slug:'sample-renovation', sample:true, type:'renovation', status:'sample',
      title:{mn:'Засвар, өргөтгөл', en:'Renovation and extension'}, location:UB,
      text:{mn:'Одоо байгаа барилгын хийц, дулаалгыг шалгаж, өргөтгөл болон шинэчлэлийн зургийг норм дүрмийн дагуу боловсруулна.',
            en:'We assess the structure and insulation of an existing building and prepare code-compliant drawings for its extension and upgrade.'},
      meta:[],
      images:[D.sect, D.elev]
    },
    {
      slug:'sample-site', sample:true, type:'planning', status:'sample',
      title:{mn:'Газрын байршлын төлөвлөгөө', en:'Site plan'}, location:UB,
      text:{mn:'Газрын нэгж талбар дээрх барилгын байршил, орц гарц, машины зам, ногоон байгууламжийг оновчтой төлөвлөнө.',
            en:'We place the building on your plot and plan access, driveways, parking and landscaping.'},
      meta:[{label:{mn:'Масштаб',en:'Scale'}, value:{mn:'1:500',en:'1:500'}}],
      images:[D.site, D.plan]
    }
  ];
})();
