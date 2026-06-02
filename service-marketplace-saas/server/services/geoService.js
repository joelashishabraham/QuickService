exports.nearbyQuery = (lat,lng,distance)=>({
  location:{
    $near:{
      $geometry:{
        type:"Point",
        coordinates:[parseFloat(lng),parseFloat(lat)]
      },
      $maxDistance:parseInt(distance)||5000
    }
  }
});