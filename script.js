const API = "https://lernia-sjj-assignments.vercel.app/api/challenges";

document.addEventListener("DOMContentLoaded", function (event) {
	let showFilterChallenges = document.querySelector("#show-filter-challenges"),
		hideFilterChallenges = document.querySelector("#hide-filter-challenges"),
		distinctTags = new Set();
	showFilterChallenges.addEventListener("click", function (event) {
		document.querySelector("#filter-challenges").classList.remove("hidden");
	}, false);
	hideFilterChallenges.addEventListener("click", function (event) {
		document.querySelector("#filter-challenges").classList.add("hidden");
	}, false);
	Array.from(document.querySelectorAll(".rating > input[type='range']")).forEach(function (input) {
		input.addEventListener("change", function (event) {
			console.log(input.name, input.value);
			input.previousElementSibling.style.setProperty("width", `${+input.value * 18}px`);
		}, false);
		input.dispatchEvent(new Event('change'));
	});
	fetch(API, {
		"method": "GET",
		"mode": "cors",
	}).then(function (response) {
		if (response.ok) {
			response.json().then(function (data) {
				let cardList = document.querySelector('#challenges > .card-list');
				data.challenges.forEach(function (challenge) {
					challenge.labels.forEach(function (label) {
						distinctTags.add(label);
					});
					cardList.innerHTML += `
						<li class="card" data-rating="${challenge.rating}" data-type="${challenge.type}" data-tags="${challenge.labels.join(' ')}">
							<div class="image" style="background-image: url('${challenge.image}')"></div>
							<div class="content">
								<div class="title" title="${challenge.title} (${challenge.type.replace("on", "on-")})">${challenge.title} (${challenge.type.replace("on", "on-")})</div>
								<div class="rating">
									<span><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i></span>
									<span style="width: ${challenge.rating * 18}px"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></span>
									${challenge.minParticipants}-${challenge.maxParticipants} participants
								</div>
								<div class="description">${challenge.description}</div>
							</div>
							<button class="primary on-white">Book this room</button>
						</li>
					`;
				});
				function filter (event) {
					let byType = Array.from(document.forms['filter-challenges'].elements['types[]']).filter(function (input) { return input.checked }).map(function (input) { return `[data-type="${input.value}"]`; }).join(),
						byTags = Array.from(document.forms['filter-challenges'].elements['tags[]']).filter(function (input) { return input.checked }).map(function (input) { return `[data-tags~="${input.value}"]`; }).join(),
						maxRanting = +document.forms['filter-challenges'].elements['maximum'].value,
						minRanting = +document.forms['filter-challenges'].elements['minimum'].value,
						keywords = document.forms['filter-challenges'].elements['keywords'].value.trim(),
						pattern = new RegExp(keywords.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'),
						count = 0;
					Array.from(document.querySelectorAll('#challenges .card')).forEach(function (card) {
						let rating = +card.dataset['rating'],
							title = card.querySelector(".title").textContent,
							description = card.querySelector(".description").textContent;
						if (
							byType.length > 0 &&
							byTags.length > 0 &&
							card.matches(byType) &&
							card.matches(byTags) &&
							rating >= minRanting && rating <= maxRanting &&
							(
								keywords.length == 0 ||
								pattern.test(title) ||
								pattern.test(description)
							)
						) {
							card.classList.remove("hidden");
							++count;
						} else {
							card.classList.add("hidden");
						}
					});
					if (count > 0) {
						document.querySelector("#challenges > h2").classList.add("hidden");
					} else {
						document.querySelector("#challenges > h2").classList.remove("hidden");
					}
				}
				document.forms['filter-challenges'].elements['keywords'].addEventListener("keyup", filter, false);
				Array.from(document.forms['filter-challenges'].elements).forEach(function (input) {
					input.addEventListener("change", filter, false);
				});
				let filterByTags = document.querySelector("#filter-by-tags");
				distinctTags.forEach(function (tag) {
					let input = document.createElement("input");
					input.addEventListener("change", filter, false);
					input.setAttribute("id", `tag-${tag}`);
					input.setAttribute("checked", "checked");
					input.setAttribute("class", "hidden");
					input.setAttribute("name", "tags[]");
					input.setAttribute("type", "checkbox");
					input.setAttribute("value", tag);
					filterByTags.append(input);
					filterByTags.innerHTML += `<label class="chip" for="tag-${tag}">${tag}</label>`;
				});
			}).catch(function (error) {
				console.error(error);
			});
		}
	}).catch(function (error) {
		console.error(error);
	});
}, false);