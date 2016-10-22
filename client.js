//Object holding food items at various stages
var items={
	nutriFood:[],
	mealFood:[]
};


//Object for searching food items
var handler={
	find:function(){
		var searchField=document.getElementById("search");
		connection.searchPara=encodeURIComponent(searchField.value);
		connection.nutritionix();
	},

};


// Object containing display methods
var display={
	showNutriFood:function(){
		var list=document.getElementById('nutriFoodList');
		list.innerHTML='';

		items.nutriFood.forEach(function(obj,index){
			var listItem=document.createElement('li');
			listItem.textContent='Name: '+obj.brand_name+' Calories: '+obj.nf_calories+' Fat: '+obj.nf_total_fat+' Total:'+obj.count;
			listItem.id=index;
			listItem.className='nutriList'

			listItem.setAttribute('data-foodId',obj.id);
			list.appendChild(listItem);
		});

	},
	showMealFood:function(){
		var list=document.getElementById('nutriFoodList');
		list.innerHTML='';
		items.mealFood.forEach(function(obj){
			var listItem=document.createElement('li');
			listItem.textContent=' Name: '+obj.brand_name+' Calories: '+obj.nf_calories+' Fat: '+obj.nf_total_fat+' Total:'+obj.count;

			list.appendChild(listItem);
		});
	}
}



//Nutrtionix API Parameters & Connection
var connection={
	fields:{
		fields:'item_name,item_id,brand_name,nf_calories,nf_total_fat',
		appId:'34049f5a',
		appKey:'327ef7cf036f1136b3aeea53dc207ffe'
	},
	url:'https://api.nutritionix.com/v1_1/search/',
	nutritionix:function(){
		$.ajax({
			url:this.url+this.searchPara,
			type:'get',
			data:this.fields,
			success:function(res){
				items.nutriFood=[];

				res.hits.forEach(function(val){
					items.nutriFood.push({
						id:val._id,
						brand_name: val.fields.brand_name,
						nf_calories: val.fields.nf_calories,
						nf_total_fat: val.fields.nf_total_fat,
						count:1
					});
				}); //End foreach

				display.showNutriFood();
			}	//End success
		});	//End ajax
	}	//End nutritionic fn
};


(function(){
	var list=document.getElementById('nutriFoodList');
	list.addEventListener('click',function(event){
		var listItem=event.target;
		if(listItem.className==='nutriList'){
			var itemExists=false;

			//If food exists,incr count and calories
			items.mealFood.forEach(function(obj){
				if(obj.id===listItem.getAttribute('data-foodId')){
					itemExists=true;
					obj.count++;
					obj.nf_calories+=obj.nf_calories;
					obj.nf_total_fat+=obj.nf_total_fat;
				}
			}); //End foreach

			//Otherwise just push it in array
			if(!itemExists)
				items.mealFood.push(items.nutriFood[listItem.id]);

			display.showNutriFood();
		}

	});//End of event listener

})(); //End of iife