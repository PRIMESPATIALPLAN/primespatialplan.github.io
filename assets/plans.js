/* Prime Spatial Plan — ready-made house plans ("Бэлэн зураг").
   To add a plan: copy one entry, give it a new slug, put its images in images/plans/<slug>/
   and list them under `images` (gallery) and `sheets` (floor plans). Room geometry (in metres)
   drives the specs and lets visitors open the plan in the online drawing tool.
   Prices: set a number in ₮ (e.g. 1500000) or leave null to show "price on request". */
window.PSP_PLAN_OPTIONS = {
  currency: '₮',
  packages: [
    {id:'pdf',  mn:'Ажлын зураг, PDF',              en:'Working drawings, PDF',            dmn:'1 барилга барих эрхтэй', den:'Licence to build once', price:null},
    {id:'print',mn:'PDF + хэвлэмэл 3 хувь',          en:'PDF + 3 printed sets',             dmn:'Барилгын ажилд шууд ашиглана', den:'Ready to use on site', price:null, best:true},
    {id:'cad',  mn:'PDF + DWG эх файл',             en:'PDF + DWG source files',           dmn:'Өөрчлөлт хийх, олон удаа барих', den:'Edit and build more than once', price:null}
  ],
  mirror: {mn:'Толин тусгал хувилбар', en:'Mirrored version', price:null},
  foundations: [
    {id:'strip', mn:'Туузан суурь', en:'Strip footing', price:0},
    {id:'slab',  mn:'Хавтан суурь', en:'Raft slab',     price:null},
    {id:'pile',  mn:'Баганан суурь', en:'Pile / pad',    price:null}
  ],
  addons: [
    {id:'struct', mn:'Бүтээцийн тооцоо',                 en:'Structural calculations',          price:null},
    {id:'mep',    mn:'Инженерийн сүлжээ (ус, дулаан, цахилгаан)', en:'MEP: water, heating, electrical', price:null},
    {id:'boq',    mn:'Материалын тооцоо (төсөв)',         en:'Bill of quantities',               price:null},
    {id:'render', mn:'Өнгөт 3D дүрслэл',                  en:'Colour 3D renders',                price:null}
  ]
};

(function(){
  function R(t, x, y, w, h){ return {type:t, x:x, y:y, w:w, h:h}; }
  window.PSP_PLANS = [
    {
      slug:'h100', code:'PSP-H100', sample:true,
      title:{mn:'Нэг давхар амины сууц, 2 унтлагын өрөө', en:'Single-storey house, 2 bedrooms'},
      lead:{mn:'Нэг давхарт багтсан, гадна хананы талбай багатай дөрвөлжин хэлбэр. Зочны өрөө, гал тогоо урд талдаа, унтлагын өрөөнүүд коридороор тусгаарлагдсан.',
            en:'A compact square plan on one level with little exterior wall. Living room and kitchen face the front; bedrooms sit behind a corridor.'},
      roof:{type:'hip', color:'#2f5d86', mat:'tile'}, facade:'brick', tags:['oneStorey', 'compact', 'storage'],
      floors:[{rooms:[R('living',0,0,6,5), R('kitchen',6,0,4,5), R('hall',0,5,10,1.5), R('bed',0,6.5,4,3.5), R('bed',4,6.5,3.5,3.5), R('bath',7.5,6.5,2.5,2), R('storage',7.5,8.5,2.5,1.5)]}]
    },
    {
      slug:'h150', code:'PSP-H150', sample:true,
      title:{mn:'Нэг давхар амины сууц, гаражтай', en:'Single-storey house with garage'},
      lead:{mn:'Нэг давхарт 2 унтлагын өрөө, 2 ариун цэврийн өрөөтэй. Гаражаас жижиг үүдний өрөөгөөр дамжин шууд гал тогоо руу орно.',
            en:'Two bedrooms and two bathrooms on one level, with a small mud room linking the garage straight to the kitchen.'},
      roof:{type:'gable', color:'#2b2d31', mat:'seam'}, facade:'timber', tags:['oneStorey', 'garage', 'mudroom', 'twoBaths'],
      floors:[{rooms:[R('living',0,0,6.5,5), R('kitchen',6.5,0,4,4), R('hall',10.5,0,1.5,4), R('garage',12,0,4,7), R('hall',6.5,4,2,6), R('bed',0,5,4,5), R('bath',4,5,2.5,2.5), R('storage',4,7.5,2.5,2.5), R('bed',8.5,4,3.5,3.5), R('bath',8.5,7.5,3.5,2.5)]}]
    },
    {
      slug:'h180', code:'PSP-H180', sample:true,
      title:{mn:'Хоёр давхар амины сууц, гаражтай', en:'Two-storey house with garage'},
      lead:{mn:'Доод давхарт зочны өрөө, гал тогоо, ажлын өрөө, гараж; дээд давхарт 3 унтлагын өрөө, тагттай. Газрын талбай бага шаардана.',
            en:'Living room, kitchen, study and garage downstairs; three bedrooms and a balcony upstairs. Needs a small plot.'},
      roof:{type:'hip', color:'#8e3b2e', mat:'tile'}, facade:'auto', tags:['twoStorey', 'garage', 'balcony', 'study', 'twoBaths'],
      floors:[
        {rooms:[R('living',0,0,6,5), R('kitchen',6,0,4,3.5), R('hall',6,3.5,2,3.5), R('bath',8,3.5,2,2), R('storage',8,5.5,2,1.5), R('garage',10,0,4,7), R('study',0,5,4,3), R('hall',4,5,2,3)]},
        {rooms:[R('bed',0,0,4.5,4), R('bed',4.5,0,4,4), R('bath',8.5,0,2.5,2.5), R('hall',0,4,10,1.5), R('bed',0,5.5,5,3.5), R('balcony',5,5.5,3,2), R('storage',8.5,2.5,2.5,1.5)]}
      ]
    }
  ];
  /* images are generated per plan: exterior renders, elevation, 3D cut, and plan sheets per floor */
  window.PSP_PLANS.forEach(function(p){
    var d = 'images/plans/' + p.slug + '/';
    p.images = [
      {src:d + 'persp.jpg', b:{mn:'3D —', en:'3D —'}, cap:{mn:'Хүний нүдний өндрөөс', en:'Eye-level view'}},
      {src:d + 'ext-1.jpg', b:{mn:'3D —', en:'3D —'}, cap:{mn:'Урд, баруун талаас', en:'Front right view'}},
      {src:d + 'ext-2.jpg', b:{mn:'3D —', en:'3D —'}, cap:{mn:'Ар, зүүн талаас', en:'Rear left view'}},
      {src:d + 'front.jpg', b:{mn:'Фасад —', en:'Elevation —'}, cap:{mn:'Урд фасад', en:'Front elevation'}},
      {src:d + 'cut-1.jpg', b:{mn:'3D зүсэлт —', en:'3D cut —'}, cap:{mn:'1-р давхар', en:'Ground floor'}}
    ];
    if(p.floors.length > 1) p.images.push({src:d + 'cut-2.jpg', b:{mn:'3D зүсэлт —', en:'3D cut —'}, cap:{mn:'2-р давхар', en:'First floor'}});
    p.sheets = p.floors.map(function(_, i){ return {src:d + 'plan-' + (i + 1) + '.png', cap:i ? {mn:'2-р давхрын план', en:'First floor plan'} : {mn:'1-р давхрын план', en:'Ground floor plan'}}; });
  });
})();
