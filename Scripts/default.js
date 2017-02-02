var imageTimers = [];
var currentPage = 1;

$(function () {
	if (!sessionStorage.pagination) { sessionStorage.pagination = 10; }

	$(window).on({
		hashchange: router
	});

	router();
});

function router() {
	stopImageTimers();
	$(".error").html('');

	switch(window.location.hash.substr(1)) {
		case '':
		case 'AssetTable':
			showAssetTable();
			break;
		case 'AddNew':
			showAddNewAsset();
			break;
		default:
			showAssetView(window.location.hash.substr(1));
	}
}

function changeAssetImage(asset_id, selector) {
	var i = assetList[asset_id].images;
	var newIndex = (parseInt($(selector).attr("data-index")) + 1) % i.length;

	var imageSrc = i[newIndex].image_data ? i[newIndex].image_data : "Images/placeholder.png";
	$(selector).attr("data-index", newIndex).attr("src", imageSrc);
}

function hideAllContainers() {
	$(".asset_table_page").hide();
	$(".asset_view_page").hide();
	$(".add_new_asset_page").hide();
}

function stopImageTimers() {
	imageTimers.forEach(function (timer) {
		clearInterval(timer);
	});

	imageTimers = [];
}

function populateCategoryDropdown(category_id) {
	var html = "";
	categoryList.forEach(function (category) {
		html += "<option value='" + category.category_id + "'>" + category.category +"</option>";
	});
	$("select[name='category_id']").html(html).val(category_id || 1);
}

function populateOwnerDropdown(owner_id) {
	var html = "";
	ownerList.forEach(function (owner) {
		html += "<option value='" + owner.owner_id + "'>" + owner.name +"</option>";
	});
	$("select[name='owner_id']").html(html).val(owner_id || 1);
}

/* --------------------- Asset Table --------------------- */

function showAssetTable() {
	if (assetList) {
		generateAssetTable();
	} else {
		getAssets().then(function () {
			generateAssetTable();
		});
	}
}

function generateAssetTable() {
	var html = "";

	html +="<thead>";
	html +="    <tr>";
	html +="        <th class='sorttable_nosort'></th> ";
	html +="        <th>ID</th> ";
	html +="        <th class='sorttable_nosort'>Image</th> ";
	html +="        <th>Category</th> ";
	html +="        <th>Brand</th>";
	html +="        <th>Goods Carried</th>";
	html +="        <th>Home Base</th>";
	html +="        <th>Route</th>";
	html +="    </tr>";
	html +="</thead>";
	html +="<tbody>";
	for (var asset_id in assetList) {
		var asset = assetList[asset_id];
		html +="<tr> ";
		html +="    <td>";
		html +="        <div class='select_link' onclick='window.location.hash = " + asset.asset_id + ";'>Select</div>";
		html +="    </td>";
		html +="    <td>" + asset.asset_id + "</td>";
		html +="    <td class='thumbnail_container' data-asset-id='" + asset.asset_id + "'>";
		if (asset.images.length) {
			asset.images.forEach(function (image) {
				if (image.image_data) {
					html +="<div><img class='asset_thumbnail' src='" + image.image_data + "' alt='asset image' /></div>";
				}
			});
		}
		html += "   </td>";
		html +="    <td>" + asset.category + "</td>";
		html +="    <td>" + asset.brand + "</td>";
		html +="    <td>" + asset.goods_carried + "</td>";
		html +="    <td>" + asset.home_base + "</td>";
		html +="    <td>" + asset.route + "</td>";
		html +="</tr>";

		// if (asset.images.length > 0) {
		// 	imageTimers.push(setInterval(function (asset_id, selector) {
		// 		// changeAssetImage(asset_id, selector);
		// 	}, 5000, asset.asset_id, ".asset_thumbnail[data-asset-id='" + asset.asset_id + "']"));
		// }
	}

	html += "</tbody>";

	hideAllContainers();
	$(".asset_table").html(html);
	$(".asset_table_page").show();

	// Make table sortable
	sorttable.makeSortable($(".asset_table").get(0));
	$(".asset_table thead th:not(.sorttable_nosort)").click(changePage);

	changePage();

	$(".thumbnail_container").slick({
		autoplay: true,
		arrows: false
	});
}

function filterAssetTable() {
	var filter = $(".filter").val().toUpperCase();
	$(".asset_table tbody tr").each(function (index, row) {
		var cell = $(row).children('td:not(.thumbnail_container)');
		if (cell) {
			if (cell.text().toUpperCase().indexOf(filter) > -1) {
				$(row).removeClass('hidden');
			} else {
				$(row).addClass('hidden');
			}
		}
	});

	changePage();
}

function changePagination(val) {
	currentPage = 1;
	sessionStorage.pagination = val;
	changePage();
}

function nextPage() {
	currentPage += 1;
	changePage();
}

function previousPage() {
	currentPage -= 1;
	changePage();
}

function changePage() {
	$(".pageNumber").text(currentPage);
	var p = sessionStorage.pagination || 10;

	if (p !== "Infinity") {
		var lowerLimit = (currentPage - 1) * p;
		var upperLimit = currentPage * p - 1;

		$(".asset_table tbody tr:not(.hidden)").each(function (index, elem) {
			if (index >= lowerLimit && index <= upperLimit) {
				$(elem).show();
			} else {
				$(elem).hide();
			}
		});
		$(".pagination_controls").show();

		if (Math.ceil($(".asset_table tbody tr:not(.hidden)").length / p) <= currentPage) {
			$(".previousPage").show();
			$(".nextPage").hide();
		} else if (currentPage === 1) {
			$(".previousPage").hide();
			$(".nextPage").show();
		} else {
			$(".previousPage").show();
			$(".nextPage").show();
		}
	} else {
		$(".asset_table tbody tr").show();
		$(".pagination_controls").hide();
	}
}

/* --------------------- Asset Table --------------------- */

function showAssetView(asset_id) {
	if (assetList) {
		generateAssetView(asset_id);
	} else {
		getAssets().then(function () {
			generateAssetView(asset_id);
		});
	}
}

function generateAssetView(asset_id) {
	var asset = assetList[asset_id];

	var html = "";
	html += "<div>";
	html += "    <div class='col-sm-6'>";
	html += "        <div>";
	html += "            <label>Owner Name</label>";
	html += "            <select name='owner_id'></select>";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Rego</label>";
	html += "            <input type='text' name='rego' value='" + asset.rego + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Make</label>";
	html += "            <input type='text' name='make' value='" + asset.make + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Model</label>";
	html += "            <input type='text' name='model' value='" + asset.model + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Year</label>";
	html += "            <input type='number' name='year' value='" + asset.year + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Brand</label>";
	html += "            <input type='text' name='brand' value='" + asset.brand + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Category</label>";
	html += "            <select name='category_id'></select>";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Goods Carried</label>";
	html += "            <input type='text' name='goods_carried' value='" + asset.goods_carried + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Home Base</label>";
	html += "            <input type='text' name='home_base' value='" + asset.home_base + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Route</label>";
	html += "            <input type='text' name='route' value='" + asset.route + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <button onclick='updateAsset(" + asset.asset_id + ")'>Save</button>";
	html += "        </div>";
	html += "    </div>";
	html += "    <div class='col-sm-6 asset_image_container' data-asset-id='" + asset.asset_id + "'>";
	if (asset.images.length) {
		asset.images.forEach(function (image) {
			if (image.image_data) {
				html +="<div><img class='asset_image img-responsive' src='" + image.image_data + "' alt='asset image' /></div>";
			}
		});
	}
	html += "    </div>";
	html += "<div>";


	hideAllContainers();
	$(".asset_view_page").html(html).show();

	$(".asset_image_container").slick({
		autoplay: true,
		dots: true,
		arrows: false
	});

	if (categoryList) {
		populateCategoryDropdown(asset.category_id);
	} else {
		getCategories().then(function () {
			populateCategoryDropdown(asset.category_id);
		});
	}

	if (ownerList) {
		populateOwnerDropdown(asset.owner_id);
	} else {
		getOwners().then(function () {
			populateOwnerDropdown(asset.owner_id);
		});
	}
}

function updateAsset(asset_id) {
	var data = {
		asset_id: asset_id
	};
	var fields = $(".asset_view_page input, .asset_view_page select");
	fields.each(function (index, field) {
		data[field.name] = field.value === "" ? null : field.value;
	});

	post("API/updateAsset.cshtml", data).then(function () {
		displayMessage("success", "Asset has been updated.");
		getAssets();
	}).catch(function (error) {
		displayMessage('error', 'There was an error updating the asset. Please inform your web admin of this problem.');
		$(".error").html(error.responseText);
	});
}

/* --------------------- Asset Table --------------------- */

function showAddNewAsset() {
	hideAllContainers();
	$(".add_new_asset_page").show();
	if (categoryList) {
		populateCategoryDropdown();
	} else {
		getCategories().then(function () {
			populateCategoryDropdown();
		});
	}

	if (ownerList) {
		populateOwnerDropdown();
	} else {
		getOwners().then(function () {
			populateOwnerDropdown();
		});
	}
}

function submitForm() {
	var error = false;
	var data = {};

	var fields = $(".addNewAssetForm input:not([type='file']), .addNewAssetForm select");
	fields.each(function (index, field) {
		data[field.name] = field.value === "" ? null : field.value;
	});

	var files = document.querySelector('input[type="file"]').files;
	for (var i = 0; i < files.length; i++) {
		if (files[i].size > MAX_FILE_SIZE) {
			displayMessage("warning", "Max file size is " + (MAX_FILE_SIZE / 1000) + " kilobytes.<br />" + files[i].name + " is " + parseInt(files[i].size / 1000) + " kilobytes.");
			error = true;
		}
	}

	if (!error) {
		post("API/addNewAsset.cshtml", data).then(function (asset_id) {
			if (files.length) {
				displayMessage("success", "Asset has been added. Images are now being uploaded");

				var promises = [];
				for (var i = 0; i < files.length; i++) {
					promises.push(uploadImage(files[i], parseInt(asset_id))); /* parseInt removes the return character added to the end of asset_id. Why it's there I don't know */
				}

				Promise.all(promises).then(function () {
					displayMessage("success", "Images have been uploaded");
					$(".addNewAssetForm input").val('');
				}).catch(function (error) {
					displayMessage("error", error);
				});
			} else {
				displayMessage("success", "Asset has been added.");
			}
		}).catch(function (error) {
			displayMessage('error', 'There was an error adding the new asset. Please inform your web admin of this problem.');
			$(".error").html(error.responseText);
		});
	}
}

function uploadImage(file, asset_id) {
	return new Promise(function (resolve, reject) {
		getDataURI(file).then(function (image) {
			image.asset_id = asset_id;
			return post("API/uploadImage.cshtml", image).then(function () {
				resolve();
			}).catch(function (error) {
				$(".error").html(error.responseText);
				displayMessage('error', 'There was an error uploading an image. Please inform your web admin of this problem.');
				reject(error);
			});
		}).catch(function (error) {
			reject(error);
		});
	});
}

function getDataURI(file) {
	return new Promise(function (resolve, reject) {
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function () {
			resolve({
				name: file.name,
				size: file.size,
				image_data: reader.result
			});
		};
		reader.onerror = function (error) {
			reject(error);
		};
	});
}
