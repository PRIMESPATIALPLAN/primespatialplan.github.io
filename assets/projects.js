/* Prime Spatial Plan — project data.
   To add a real project: put its images in images/<slug>/ and add an entry to PROJECTS below
   (newest first). Optional: credit {mn,en}, tabs [{id,t,p,list,imgs}] for a sheet-by-sheet project page.
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
  done:     {mn:'Ашиглалтад орсон', en:'Completed'},
  concept:  {mn:'Концепц',          en:'Concept'}
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
      slug:'railway-complex', type:'apartment', status:'concept', year:'2026',
      title:{mn:'Монголын төмөр замын хотхон, 3 га', en:'Mongolian Railway complex, 3 ha'},
      location:{mn:'Монгол', en:'Mongolia'},
      text:{mn:'3 га талбайд орон сууцны дөрвөн блок, оффисын барилга, сургууль, цэцэрлэгийг нэг хотхон болгон төлөвлөсөн. Блокуудын хооронд хүүхдийн тоглоомын болон спортын талбай бүхий хашаа, гудамжны дагуу зогсоолтой.',
            en:'A 3-hectare complex of four residential blocks, an office building, a school and a kindergarten, with courtyards of playgrounds and sports courts between the blocks and parking along the street.'},
      credit:{mn:'Архитектор: Г.Мөнх-Алдар', en:'Architect: G. Munkh-Aldar'},
      meta:[{label:{mn:'Талбай',en:'Site area'}, value:{mn:'3 га',en:'3 ha'}},
            {label:{mn:'Бүрэлдэхүүн',en:'Programme'}, value:{mn:'Орон сууц, оффис, сургууль, цэцэрлэг',en:'Housing, office, school, kindergarten'}},
            {label:{mn:'Шат',en:'Stage'}, value:{mn:'Концепц, 3D дүрслэл',en:'Concept, 3D visuals'}}],
      images:[{src:'images/railway-complex/aerial.jpg',b:{mn:'Ерөнхий дүрслэл —',en:'Overview —'},cap:{mn:'Орон сууцны дөрвөн блок, оффисын барилга, гудамж, зогсоол',en:'Four residential blocks, office building, street and parking'}},{src:'images/railway-complex/plan.jpg',b:{mn:'Ерөнхий төлөвлөгөө —',en:'Master plan —'},cap:{mn:'Дээрээс харсан байдал: барилгууд, гудамж, зогсоол, тоглоомын болон спортын талбай',en:'Top view: buildings, street, parking, play and sports areas'}},{src:'images/railway-complex/courtyard.jpg',b:{mn:'Хашаа —',en:'Courtyard —'},cap:{mn:'Блокуудын хоорондох тоглоомын болон спортын талбай',en:'Play and sports areas between the blocks'}},{src:'images/railway-complex/birdseye.jpg',b:{mn:'Хашаа —',en:'Courtyard —'},cap:{mn:'Сагсан бөмбөгийн талбай, тоглоомын талбайнууд',en:'Basketball court and playgrounds'}},{src:'images/railway-complex/towers.jpg',b:{mn:'Орон сууц —',en:'Residential blocks —'},cap:{mn:'Орон сууцны блокууд, оффисын барилгын хамт',en:'Residential blocks with the office building'}},{src:'images/railway-complex/playground.jpg',b:{mn:'Тоглоомын талбай —',en:'Playground —'},cap:{mn:'Хашаан доторх хүүхдийн тоглоомын талбай',en:'Children’s playground in the courtyard'}},{src:'images/railway-complex/street.jpg',b:{mn:'Гудамжнаас —',en:'From the street —'},cap:{mn:'Орон сууцны блокууд явган хүний түвшнээс',en:'Residential blocks at street level'}}],
      tabs:[
        {id:'visuals', t:{mn:'3D дүрслэл',en:'3D visuals'},
         p:{mn:'Хотхоны концепцийн дүрслэл. Баригдаагүй.',en:'Concept visuals of the complex. Not built.'},
         imgs:[{src:'images/railway-complex/aerial.jpg',b:{mn:'Ерөнхий дүрслэл —',en:'Overview —'},cap:{mn:'Орон сууцны дөрвөн блок, оффисын барилга, гудамж, зогсоол',en:'Four residential blocks, office building, street and parking'}},{src:'images/railway-complex/plan.jpg',b:{mn:'Ерөнхий төлөвлөгөө —',en:'Master plan —'},cap:{mn:'Дээрээс харсан байдал: барилгууд, гудамж, зогсоол, тоглоомын болон спортын талбай',en:'Top view: buildings, street, parking, play and sports areas'}},{src:'images/railway-complex/courtyard.jpg',b:{mn:'Хашаа —',en:'Courtyard —'},cap:{mn:'Блокуудын хоорондох тоглоомын болон спортын талбай',en:'Play and sports areas between the blocks'}},{src:'images/railway-complex/birdseye.jpg',b:{mn:'Хашаа —',en:'Courtyard —'},cap:{mn:'Сагсан бөмбөгийн талбай, тоглоомын талбайнууд',en:'Basketball court and playgrounds'}},{src:'images/railway-complex/towers.jpg',b:{mn:'Орон сууц —',en:'Residential blocks —'},cap:{mn:'Орон сууцны блокууд, оффисын барилгын хамт',en:'Residential blocks with the office building'}},{src:'images/railway-complex/playground.jpg',b:{mn:'Тоглоомын талбай —',en:'Playground —'},cap:{mn:'Хашаан доторх хүүхдийн тоглоомын талбай',en:'Children’s playground in the courtyard'}},{src:'images/railway-complex/street.jpg',b:{mn:'Гудамжнаас —',en:'From the street —'},cap:{mn:'Орон сууцны блокууд явган хүний түвшнээс',en:'Residential blocks at street level'}}]}
      ]
    },
    {
      slug:'house-district', type:'planning', status:'concept', year:'2026',
      title:{mn:'Амины сууцны хороолол, 20 га', en:'Residential district, 20 ha'},
      location:{mn:'Монгол', en:'Mongolia'},
      text:{mn:'20 га талбайд амины орон сууцны хороолол төлөвлөсөн. Төвд нь хөшөө, усан оргилуур, тоглоомын болон спортын талбай бүхий цэцэрлэгт хүрээлэн, сургууль байрлана. Гудамж бүр явган зам, дугуйн зам, ногоон зурвастай.',
            en:'A 20-hectare residential district of detached houses around a central park with a sculpture, fountain, play and sports courts, and a school. Every street has a footpath, cycle lane and green verge.'},
      credit:{mn:'Архитектор: Г.Мөнх-Алдар', en:'Architect: G. Munkh-Aldar'},
      meta:[{label:{mn:'Талбай',en:'Site area'}, value:{mn:'20 га',en:'20 ha'}},
            {label:{mn:'Бүрэлдэхүүн',en:'Programme'}, value:{mn:'Амины сууц, сургууль, цэцэрлэгт хүрээлэн, спорт талбай',en:'Houses, school, park, sports courts'}},
            {label:{mn:'Шат',en:'Stage'}, value:{mn:'Концепц, 3D дүрслэл',en:'Concept, 3D visuals'}}],
      images:[{src:'images/house-district/aerial.jpg',b:{mn:'Ерөнхий төлөвлөгөө —',en:'Master plan —'},cap:{mn:'Хороололын төв цэцэрлэгт хүрээлэн, гудамжны сүлжээ, амины сууцны хэсгүүд',en:'Central park, street network and house plots'}},{src:'images/house-district/square.jpg',b:{mn:'Төв талбай —',en:'Central square —'},cap:{mn:'Хөшөө, усан оргилуур, сүүдрэвч бүхий төв талбай, цаана нь сургууль',en:'Square with sculpture, fountain and pavilions, school behind'}},{src:'images/house-district/school.jpg',b:{mn:'Сургууль —',en:'School —'},cap:{mn:'Хороололын сургууль, хүүхдийн тоглоомын талбай',en:'Neighbourhood school and playground'}},{src:'images/house-district/street.jpg',b:{mn:'Гудамж —',en:'Street —'},cap:{mn:'Явган зам, дугуйн зам, ногоон зурвас бүхий орон сууцны гудамж',en:'Residential street with footpath, cycle lane and green verge'}},{src:'images/house-district/house-garage.jpg',b:{mn:'Амины сууц —',en:'House —'},cap:{mn:'Хонгилын давхарт гарааштай хоёр давхар сууц',en:'Two-storey house with a garage in the lower level'}},{src:'images/house-district/house.jpg',b:{mn:'Амины сууц —',en:'House —'},cap:{mn:'Хоёр давхар амины сууцны загвар',en:'Two-storey house type'}}],
      tabs:[
        {id:'visuals', t:{mn:'3D дүрслэл',en:'3D visuals'},
         p:{mn:'Хороололын концепцийн дүрслэл. Баригдаагүй.',en:'Concept visuals of the district. Not built.'},
         imgs:[{src:'images/house-district/aerial.jpg',b:{mn:'Ерөнхий төлөвлөгөө —',en:'Master plan —'},cap:{mn:'Хороололын төв цэцэрлэгт хүрээлэн, гудамжны сүлжээ, амины сууцны хэсгүүд',en:'Central park, street network and house plots'}},{src:'images/house-district/square.jpg',b:{mn:'Төв талбай —',en:'Central square —'},cap:{mn:'Хөшөө, усан оргилуур, сүүдрэвч бүхий төв талбай, цаана нь сургууль',en:'Square with sculpture, fountain and pavilions, school behind'}},{src:'images/house-district/school.jpg',b:{mn:'Сургууль —',en:'School —'},cap:{mn:'Хороололын сургууль, хүүхдийн тоглоомын талбай',en:'Neighbourhood school and playground'}},{src:'images/house-district/street.jpg',b:{mn:'Гудамж —',en:'Street —'},cap:{mn:'Явган зам, дугуйн зам, ногоон зурвас бүхий орон сууцны гудамж',en:'Residential street with footpath, cycle lane and green verge'}},{src:'images/house-district/house-garage.jpg',b:{mn:'Амины сууц —',en:'House —'},cap:{mn:'Хонгилын давхарт гарааштай хоёр давхар сууц',en:'Two-storey house with a garage in the lower level'}},{src:'images/house-district/house.jpg',b:{mn:'Амины сууц —',en:'House —'},cap:{mn:'Хоёр давхар амины сууцны загвар',en:'Two-storey house type'}}]}
      ]
    },
    {
      slug:'arvaikheer-residence', type:'apartment', status:'design', year:'2026',
      title:{mn:'Үйлчилгээтэй орон сууцны хотхон', en:'Residential complex with services'},
      location:{mn:'Арвайхээр, Өвөрхангай', en:'Arvaikheer, Uvurkhangai'},
      text:{mn:'Хоёр блокоос бүрдэх 10 давхар, 118 айлын үйлчилгээтэй орон сууц. Бага талбайд газрын нөөцийг хамгийн үр ашигтай ашиглаж, блокуудын хоорондын зай, нарны гэрэл, сүүдэрлэлтэд тулгуурлан төлөвлөсөн.',
            en:'A 10-storey, 118-apartment residential complex with ground-floor services in two blocks, planned to make the most of a small plot around the spacing between blocks, daylight and shadow.'},
      credit:{mn:'Архитектор: Г.Мөнх-Алдар', en:'Architect: G. Munkh-Aldar'},
      meta:[{label:{mn:'Газрын талбай',en:'Plot'}, value:{mn:'2 612 м²',en:'2,612 m²'}},
            {label:{mn:'Давхар',en:'Storeys'}, value:{mn:'10 + техникийн давхар, зоорь',en:'10 + technical floor, basement'}},
            {label:{mn:'Айл',en:'Apartments'}, value:{mn:'118',en:'118'}},
            {label:{mn:'Зогсоол',en:'Parking'}, value:{mn:'Ил 15 · Далд 36',en:'15 open · 36 underground'}},
            {label:{mn:'Шат',en:'Stage'}, value:{mn:'Загвар зураг',en:'Schematic design'}}],
      images:[{src:'images/arvaikheer/render-3.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Хоёр блок урд талаас',en:'Both blocks from the front'}},{src:'images/arvaikheer/render-1.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Хоёр блокийн дундах гадна талбай',en:'Courtyard between the two blocks'}},{src:'images/arvaikheer/render-2.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Орц, авто замын тал',en:'Entrance and driveway side'}},{src:'images/arvaikheer/render-4.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Б блок, тоглоомын талбай',en:'Block B and the playground'}}],
      tabs:[
        {id:'plans', t:{mn:'Давхрын план',en:'Floor plans'},
         p:{mn:'Зоорийн давхарт далд зогсоол, 1-р давхарт дэлгүүр, үйлчилгээ, 2–10-р давхарт 2, 3 өрөө байр байрлана.',
            en:'Underground parking in the basement, shops and services on the ground floor, two- and three-room apartments on floors 2–10.'},
         list:[{mn:'«A» 3 өрөө — 72.94 м²',en:'“A” 3 rooms — 72.94 m²'},{mn:'«B» 2 өрөө — 54.13 м²',en:'“B” 2 rooms — 54.13 m²'},{mn:'«C» 2 өрөө — 49.70 м²',en:'“C” 2 rooms — 49.70 m²'},{mn:'«D» 2 өрөө — 58.46 м²',en:'“D” 2 rooms — 58.46 m²'},{mn:'«E» 3 өрөө — 68.86 м²',en:'“E” 3 rooms — 68.86 m²'}],
         imgs:[{src:'images/arvaikheer/plan-1.jpg',contain:true,b:{mn:'Зоорийн давхар —',en:'Basement —'},cap:{mn:'М 1:200',en:'1:200'}},{src:'images/arvaikheer/plan-2.jpg',contain:true,b:{mn:'1-р давхар —',en:'Ground floor —'},cap:{mn:'М 1:100',en:'1:100'}},{src:'images/arvaikheer/plan-3.jpg',contain:true,b:{mn:'1-р давхар —',en:'Ground floor —'},cap:{mn:'М 1:100, нөгөө блок',en:'1:100, other block'}},{src:'images/arvaikheer/plan-4.jpg',contain:true,b:{mn:'2–10-р давхар —',en:'Floors 2–10 —'},cap:{mn:'М 1:100',en:'1:100'}},{src:'images/arvaikheer/plan-5.jpg',contain:true,b:{mn:'Техникийн давхар —',en:'Technical floor —'},cap:{mn:'М 1:100',en:'1:100'}},{src:'images/arvaikheer/plan-6.jpg',contain:true,b:{mn:'Дээвэр —',en:'Roof —'},cap:{mn:'М 1:100',en:'1:100'}}]},
        {id:'visuals', t:{mn:'3D дүрслэл',en:'3D visuals'},
         p:{mn:'Барилга, гадна талбайн дүрслэл.',en:'Visuals of the buildings and outdoor spaces.'},
         imgs:[{src:'images/arvaikheer/render-1.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Хоёр блокийн дундах гадна талбай',en:'Courtyard between the two blocks'}},{src:'images/arvaikheer/render-2.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Орц, авто замын тал',en:'Entrance and driveway side'}},{src:'images/arvaikheer/render-3.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Хоёр блок урд талаас',en:'Both blocks from the front'}},{src:'images/arvaikheer/render-4.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Б блок, тоглоомын талбай',en:'Block B and the playground'}}]}
      ]
    }
  ];
})();
