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
      slug:'arvaikheer-residence', type:'apartment', status:'design', year:'2026',
      title:{mn:'Үйлчилгээтэй орон сууцны хотхон', en:'Residential complex with services'},
      location:{mn:'Арвайхээр, Өвөрхангай', en:'Arvaikheer, Uvurkhangai'},
      text:{mn:'Хоёр блокоос бүрдэх 10 давхар, 118 айлын үйлчилгээтэй орон сууц. Бага талбайд газрын нөөцийг хамгийн үр ашигтай ашиглаж, блокуудын хоорондын зай, нарны гэрэл, сүүдэрлэлтэд тулгуурлан төлөвлөсөн.',
            en:'A 10-storey, 118-apartment residential complex with ground-floor services in two blocks, planned to make the most of a small plot around the spacing between blocks, daylight and shadow.'},
      credit:{mn:'Архитектор: Г.Мөнх-Алдар · Гүйцэтгэгч байгууллага: «ЗЭДПРОЖЕКТ» ХХК', en:'Architect: G. Munkh-Aldar · Delivered with ZEDPROJECT LLC'},
      meta:[{label:{mn:'Газрын талбай',en:'Plot'}, value:{mn:'2 612 м²',en:'2,612 m²'}},
            {label:{mn:'Давхар',en:'Storeys'}, value:{mn:'10 + техникийн давхар, зоорь',en:'10 + technical floor, basement'}},
            {label:{mn:'Айл',en:'Apartments'}, value:{mn:'118',en:'118'}},
            {label:{mn:'Зогсоол',en:'Parking'}, value:{mn:'Ил 15 · Далд 36',en:'15 open · 36 underground'}},
            {label:{mn:'Шат',en:'Stage'}, value:{mn:'Загвар зураг',en:'Schematic design'}}],
      images:[{src:'images/arvaikheer/render-3.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Хоёр блок урд талаас',en:'Both blocks from the front'}},{src:'images/arvaikheer/render-1.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Хоёр блокийн дундах гадна талбай',en:'Courtyard between the two blocks'}},{src:'images/arvaikheer/render-2.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Орц, авто замын тал',en:'Entrance and driveway side'}},{src:'images/arvaikheer/render-4.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Б блок, тоглоомын талбай',en:'Block B and the playground'}}],
      tabs:[
        {id:'concept', t:{mn:'Төлөвлөлтийн санаа',en:'Design concept'},
         p:{mn:'Захиалагчийн хүсэлтээр 10 давхар, 118 айлын үйлчилгээтэй орон сууц төлөвлөсөн. Анхны санаа нь газрын хэмжээ, блокуудын хоорондын зай, байгалийн гэрэлтүүлэг, сүүдэрлэлтийн нөхцөлд үндэслэсэн. Талбай харьцангуй бага тул газрын нөөцийг хамгийн үр ашигтай ашиглах зарчмаар дараах дөрвөн алхмаар хэлбэржүүлсэн. Фасадыг орчны барилгын өнгө төрхтэй уялдуулан эдэлгээ сайтай металл хавтангаар шийдсэн.',
            en:'The client asked for a 10-storey, 118-apartment building with services. The concept grew from the plot size, the spacing between blocks, daylight and shadow. Because the plot is small, the form was developed in four steps to use the land as efficiently as possible. The façade uses durable metal panels in tones that match the surrounding buildings.'},
         list:[{mn:'Үндсэн газарт хоёр блокийг байрлуулж газрын хуваалт үүссэн',en:'Two blocks placed on the plot set the site division'},
               {mn:'Норм дүрмийн дагуу талбай бүрийг м²-ээр тааруулсан',en:'Each area sized in m² to the codes'},
               {mn:'Үндсэн барилгын хэлбэр үүссэн',en:'The main building form emerged'},
               {mn:'Зоорийн давхар болон бусад шаардлагыг нэмсэн',en:'Basement and remaining requirements added'}],
         imgs:[{src:'images/arvaikheer/concept.jpg',contain:true,b:{mn:'Төлөвлөлтийн санаа —',en:'Design concept —'},cap:{mn:'Газрын хуваалтаас барилгын хэлбэр хүртэл',en:'From site division to building form'}}]},
        {id:'context', t:{mn:'Орчны тойм',en:'Context'},
         p:{mn:'Төслийн талбай Арвайхээр сумын Онги 13-р багт, Занабазарын цэцэрлэгт хүрээлэн болон хотын төвийн ойролцоо байрлана. 500 м, 1 000 м-ийн радиуст сургууль, цэцэрлэг, үйлчилгээний байгууллагууд хүрэлцээтэй.',
            en:'The site is in Onggi 13th bag of Arvaikheer, close to Zanabazar park and the town centre. Schools, kindergartens and services lie within 500 m and 1,000 m.'},
         imgs:[{src:'images/arvaikheer/context.jpg',contain:true,b:{mn:'Орчны тойм —',en:'Context —'},cap:{mn:'М 1:5 000',en:'1:5,000'}}]},
        {id:'masterplan', t:{mn:'Ерөнхий төлөвлөгөө',en:'Master plan'},
         p:{mn:'2 612 м² талбайд хоёр блок, ил задгай автомашины зогсоол, хог ангилах цэг, хүүхдийн тоглоомын талбай, амралтын талбай, ногоон байгууламжийг төлөвлөсөн. Дулаан гарааш руу орох пандусыг барилгын баруун хойд талаас оруулсан.',
            en:'The 2,612 m² plot holds two blocks, open parking, a waste-sorting point, a children\u2019s playground, a rest area and landscaping. The ramp to the heated garage enters from the north-west.'},
         list:[{mn:'Ил зогсоол — 15',en:'Open parking — 15'},{mn:'Далд зогсоол — 36',en:'Underground parking — 36'},{mn:'ХБИ-ний зогсоол — 1',en:'Accessible parking — 1'},{mn:'Пандус: машин 1, ХБИ 3',en:'Ramps: 1 vehicle, 3 accessible'},{mn:'Эрчим хүч хэмнэх технологи — Тийм',en:'Energy-saving technology — Yes'}],
         imgs:[{src:'images/arvaikheer/siteplan.jpg',contain:true,b:{mn:'Ерөнхий төлөвлөгөө —',en:'Master plan —'},cap:{mn:'М 1:500',en:'1:500'}}]},
        {id:'circulation', t:{mn:'Хөдөлгөөний схем',en:'Circulation'},
         p:{mn:'Автомашин, явган зорчигч, дугуйн хөдөлгөөнийг тусгаарлаж, онцгой үед галын машин барилгыг тойрон зорчих замыг тусгасан. Гудамжны огтлол: ногоон байгууламж 4.0 м · явган зам 1.5 м · зогсоол 5.5 м · авто зам 7.0 м · дугуйн зам 1.5 м.',
            en:'Cars, pedestrians and cyclists are kept apart, with an emergency fire-truck route around the building. Street section: green 4.0 m · footpath 1.5 m · parking 5.5 m · road 7.0 m · cycle lane 1.5 m.'},
         imgs:[{src:'images/arvaikheer/circulation.jpg',contain:true,b:{mn:'Хөдөлгөөний схем —',en:'Circulation —'},cap:{mn:'М 1:500, гудамжны огтлол',en:'1:500, street section'}}]},
        {id:'landscape', t:{mn:'Тохижилт, ногоон байгууламж',en:'Landscape'},
         p:{mn:'Гадна талбайд мод, сүүдрэвч, сандал, нарны гэрэлтүүлэг байрлуулж, хог ялган ангилах цэгийг тусгасан.',
            en:'The outdoor areas get trees, shade pavilions, benches, solar lighting and waste-sorting points.'},
         list:[{mn:'Шар хуайс — 32 ш, 1.5–2.5 м',en:'Siberian peashrub — 32, 1.5–2.5 m'},{mn:'Нарс — 8 ш',en:'Pine — 8'},{mn:'Нарны LED гудамжны гэрэл — 7 ш, 15 м зайтай',en:'Solar LED street lights — 7, 15 m apart'},{mn:'Сүүдрэвч — 6 ш, сандал — 11 ш',en:'Shade pavilions — 6, benches — 11'},{mn:'Хогийн сав — 6 ш, хог ангилах цэг — 2',en:'Bins — 6, waste-sorting points — 2'}],
         imgs:[{src:'images/arvaikheer/landscape.jpg',contain:true,b:{mn:'Тохижилт —',en:'Landscape —'},cap:{mn:'М 1:500',en:'1:500'}}]},
        {id:'sun', t:{mn:'Нарны ээвэрлэлт',en:'Sun study'},
         p:{mn:'3-р сарын 22, 9-р сарын 22-ны 09:00–18:00 цагийн сүүдэрлэлтийг БНбД 23-04-07-ийн 3.2-т заасны дагуу тооцож, төлөвлөж буй болон орчны барилгын нарны ээвэрлэлтийг шалгасан.',
            en:'Shadows on 22 March and 22 September, 09:00–18:00, were calculated to BNbD 23-04-07 clause 3.2 to check sunlight on the new and neighbouring buildings.'},
         imgs:[{src:'images/arvaikheer/sun.jpg',contain:true,b:{mn:'Нарны ээвэрлэлт —',en:'Sun study —'},cap:{mn:'3/22 ба 9/22',en:'22 March and 22 September'}}]},
        {id:'plans', t:{mn:'Давхрын план',en:'Floor plans'},
         p:{mn:'Зоорийн давхарт далд зогсоол, 1-р давхарт дэлгүүр, үйлчилгээ, 2–10-р давхарт 2, 3 өрөө байр байрлана.',
            en:'Underground parking in the basement, shops and services on the ground floor, two- and three-room apartments on floors 2–10.'},
         list:[{mn:'«A» 3 өрөө — 72.94 м²',en:'“A” 3 rooms — 72.94 m²'},{mn:'«B» 2 өрөө — 54.13 м²',en:'“B” 2 rooms — 54.13 m²'},{mn:'«C» 2 өрөө — 49.70 м²',en:'“C” 2 rooms — 49.70 m²'},{mn:'«D» 2 өрөө — 58.46 м²',en:'“D” 2 rooms — 58.46 m²'},{mn:'«E» 3 өрөө — 68.86 м²',en:'“E” 3 rooms — 68.86 m²'}],
         imgs:[{src:'images/arvaikheer/plan-1.jpg',contain:true,b:{mn:'Зоорийн давхар —',en:'Basement —'},cap:{mn:'М 1:200',en:'1:200'}},{src:'images/arvaikheer/plan-2.jpg',contain:true,b:{mn:'1-р давхар —',en:'Ground floor —'},cap:{mn:'М 1:100',en:'1:100'}},{src:'images/arvaikheer/plan-3.jpg',contain:true,b:{mn:'1-р давхар —',en:'Ground floor —'},cap:{mn:'М 1:100, нөгөө блок',en:'1:100, other block'}},{src:'images/arvaikheer/plan-4.jpg',contain:true,b:{mn:'2–10-р давхар —',en:'Floors 2–10 —'},cap:{mn:'М 1:100',en:'1:100'}},{src:'images/arvaikheer/plan-5.jpg',contain:true,b:{mn:'Техникийн давхар —',en:'Technical floor —'},cap:{mn:'М 1:100',en:'1:100'}},{src:'images/arvaikheer/plan-6.jpg',contain:true,b:{mn:'Дээвэр —',en:'Roof —'},cap:{mn:'М 1:100',en:'1:100'}}]},
        {id:'sections', t:{mn:'Зүсэлт',en:'Sections'},
         p:{mn:'1-р давхрын өндөр 3.3 м, бусад давхар 3.0 м. Зоорь −3.50, техникийн давхар +30.30, дээвэр +34.30.',
            en:'Ground floor 3.3 m, other floors 3.0 m. Basement −3.50, technical floor +30.30, roof +34.30.'},
         imgs:[{src:'images/arvaikheer/section-1.jpg',contain:true,b:{mn:'Зүсэлт 1-1 —',en:'Section 1-1 —'},cap:{mn:'М 1:150',en:'1:150'}},{src:'images/arvaikheer/section-2.jpg',contain:true,b:{mn:'Зүсэлт —',en:'Section —'},cap:{mn:'М 1:150',en:'1:150'}}]},
        {id:'facades', t:{mn:'Фасад',en:'Façades'},
         p:{mn:'Фасадыг алтан шаргал, цайвар шар, саарал өнгийн металл хавтангаар өнгөлж, шилэн шатны хонгилоор босоо хэмнэл өгсөн.',
            en:'Façades are clad in golden-yellow, light cream and grey metal panels, with glazed stair cores adding a vertical rhythm.'},
         imgs:[{src:'images/arvaikheer/facade-1.jpg',contain:true,b:{mn:'Фасад D-A, 5-1 —',en:'Elevation D-A, 5-1 —'},cap:{mn:'М 1:150',en:'1:150'}},{src:'images/arvaikheer/facade-2.jpg',contain:true,b:{mn:'Фасад 1-5, D-A —',en:'Elevation 1-5, D-A —'},cap:{mn:'М 1:150',en:'1:150'}},{src:'images/arvaikheer/facade-3.jpg',contain:true,b:{mn:'Фасад D-A, 1-5 —',en:'Elevation D-A, 1-5 —'},cap:{mn:'М 1:150',en:'1:150'}},{src:'images/arvaikheer/facade-4.jpg',contain:true,b:{mn:'Фасад 5-1, A-D —',en:'Elevation 5-1, A-D —'},cap:{mn:'М 1:150',en:'1:150'}}]},
        {id:'visuals', t:{mn:'3D дүрслэл',en:'3D visuals'},
         p:{mn:'Барилга, гадна талбайн дүрслэл.',en:'Visuals of the buildings and outdoor spaces.'},
         imgs:[{src:'images/arvaikheer/render-1.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Хоёр блокийн дундах гадна талбай',en:'Courtyard between the two blocks'}},{src:'images/arvaikheer/render-2.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Орц, авто замын тал',en:'Entrance and driveway side'}},{src:'images/arvaikheer/render-3.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Хоёр блок урд талаас',en:'Both blocks from the front'}},{src:'images/arvaikheer/render-4.jpg',contain:false,b:{mn:'3D дүрслэл —',en:'3D visual —'},cap:{mn:'Б блок, тоглоомын талбай',en:'Block B and the playground'}}]}
      ]
    }
  ];
})();
