document.addEventListener('DOMContentLoaded', function() {
    // API endpoints
    const APIs = {
        bored: 'https://bored.api.lewagon.com/api/activity',
        dog: 'https://dog.ceo/api/breeds/image/random',
        joke: 'https://v2.jokeapi.dev/joke/Any?safe-mode',
        catFact: 'https://catfact.ninja/fact'
    };

    // Button elements
    const boredButton = document.getElementById('boredButton');
    const dogButton = document.getElementById('dogButton');
    const jokeButton = document.getElementById('jokeButton');
    const catFactButton = document.getElementById('catFactButton');
    const spaceNewsButton = document.getElementById('spaceNewsButton');

    // Output elements
    const boredOutput = document.getElementById('boredOutput');
    const dogOutput = document.getElementById('dogOutput');
    const jokeOutput = document.getElementById('jokeOutput');
    const catFactOutput = document.getElementById('catFactOutput');
    const spaceNewsOutput = document.getElementById('spaceNewsOutput');

    // Set up event listeners
    boredButton.addEventListener('click', () => fetchBoredActivity());
    dogButton.addEventListener('click', () => fetchRandomDog());
    jokeButton.addEventListener('click', () => fetchRandomJoke());
    catFactButton.addEventListener('click', () => fetchCatFact());
    spaceNewsButton.addEventListener('click', () => fetchSpaceNews());

    // Fetch Bored API
    async function fetchBoredActivity() {
        toggleButtonState(boredButton);

        try {
            const response = await fetch(APIs.bored);
            const data = await response.json();

            boredOutput.innerHTML = `
        <div class="api-output-content">
          <div class="activity">${data.activity}</div>
          <div class="details">
            <p>Type: ${data.type}</p>
            <p>Participants: ${data.participants}</p>
            <p>Price: ${data.price === 0 ? 'Free' : `$${data.price}`}</p>
          </div>
        </div>
      `;
        } catch (error) {
            boredOutput.innerHTML = `<div class="api-output-content">Failed to fetch activity. Try again.</div>`;
            console.error('Bored API error:', error);
        } finally {
            toggleButtonState(boredButton, false);
        }
    }

    // Fetch Dog API
    async function fetchRandomDog() {
        toggleButtonState(dogButton);

        try {
            const response = await fetch(APIs.dog);
            const data = await response.json();

            dogOutput.innerHTML = `
        <div class="api-output-content">
          <img src="${data.message}" alt="Random dog" class="dog-image">
        </div>
      `;
        } catch (error) {
            dogOutput.innerHTML = `<div class="api-output-content">Failed to fetch dog image. Try again.</div>`;
            console.error('Dog API error:', error);
        } finally {
            toggleButtonState(dogButton, false);
        }
    }

    // Fetch Joke API
    async function fetchRandomJoke() {
        toggleButtonState(jokeButton);

        try {
            const response = await fetch(APIs.joke);
            const data = await response.json();

            let jokeHTML;
            if (data.type === 'twopart') {
                jokeHTML = `
          <div class="joke">
            <div class="joke-setup">${data.setup}</div>
            <div class="joke-punchline">${data.delivery}</div>
          </div>
        `;
            } else {
                jokeHTML = `
          <div class="joke">${data.joke}</div>
        `;
            }

            jokeOutput.innerHTML = `<div class="api-output-content">${jokeHTML}</div>`;
        } catch (error) {
            jokeOutput.innerHTML = `<div class="api-output-content">Failed to fetch joke. Try again.</div>`;
            console.error('Joke API error:', error);
        } finally {
            toggleButtonState(jokeButton, false);
        }
    }

    // Fetch Cat Fact API
    async function fetchCatFact() {
        toggleButtonState(catFactButton);

        try {
            const response = await fetch(APIs.catFact);
            const data = await response.json();

            catFactOutput.innerHTML = `
        <div class="api-output-content">
          <div class="cat-fact">${data.fact}</div>
        </div>
      `;
        } catch (error) {
            catFactOutput.innerHTML = `<div class="api-output-content">Failed to fetch cat fact. Try again.</div>`;
            console.error('Cat Fact API error:', error);
        } finally {
            toggleButtonState(catFactButton, false);
        }
    }

    // Toggle button state between loading/ready
    function toggleButtonState(button, isLoading = true) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="loading"></span> Loading...';
        } else {
            button.disabled = false;
            // Store the original text if it hasn't been stored yet
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent.trim();
            }

            // Change text from "Try now" to "Try again" if it was "Try now"
            if (button.dataset.originalText === 'Try now') {
                button.textContent = 'Try again';
            } else {
                button.textContent = button.dataset.originalText;
            }
        }
    }
});