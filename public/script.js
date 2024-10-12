document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topicInput');
    const generateBtn = document.getElementById('generateBtn');
    const quoteImagesDiv = document.getElementById('quoteImages');
    const loader = document.getElementById('loader');
    const overlay = document.getElementById('overlay');
    const enlargedImageContainer = document.getElementById('enlarged-image-container');
    const enlargedImage = document.getElementById('enlarged-image');

    // Generate images on button click
    generateBtn.addEventListener('click', async () => {
        const topic = topicInput.value.trim();
        if (!topic) return; // Prevent generating without a topic

        quoteImagesDiv.innerHTML = ''; // Clear previous images
        loader.classList.remove('hidden'); // Show loader

        try {
            // API call to generate images
            const response = await fetch('/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (!Array.isArray(data.urls)) throw new Error('Invalid response format');

            // Render images
            data.urls.forEach((imageUrl, index) => {
                const quoteImageContainer = document.createElement('div');
                quoteImageContainer.className = 'quote-image-container';

                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `Generated image for ${topic}`;
                img.className = 'quote-image';

                // Enlarge image on click
                img.addEventListener('click', () => {
                    enlargedImage.src = img.src;
                    adjustImageSize();
                    overlay.classList.remove('hidden');
                    setTimeout(() => overlay.classList.add('active'), 50);
                });

                const quoteText = document.createElement('p');
                quoteText.textContent = data.quotes[index];
                quoteText.className = 'quote-text';

                // Download button
                const downloadBtn = document.createElement('a');
                downloadBtn.href = imageUrl;
                downloadBtn.download = `${topic}_quote_${index + 1}.jpg`;
                downloadBtn.textContent = 'Download Image';
                downloadBtn.className = 'download-btn';

                quoteImageContainer.appendChild(img);
                quoteImageContainer.appendChild(quoteText);
                quoteImageContainer.appendChild(downloadBtn);
                quoteImagesDiv.appendChild(quoteImageContainer);
            });
        } catch (error) {
            console.error('Error:', error);
            quoteImagesDiv.innerHTML = '<p>An error occurred. Please try again.</p>';
        } finally {
            loader.classList.add('hidden'); // Hide loader
        }
    });

    // Press Enter to trigger generation
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateBtn.click();
    });

    // Close the overlay when clicking outside the image
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
    });

    // Adjust image size in the overlay based on window size
    function adjustImageSize() {
        enlargedImage.onload = () => {
            const imgWidth = enlargedImage.naturalWidth;
            const imgHeight = enlargedImage.naturalHeight;
            const maxWidth = window.innerWidth * 0.8;
            const maxHeight = window.innerHeight * 0.8;

            let containerWidth = imgWidth;
            let containerHeight = imgHeight;

            // Scale down to fit the viewport
            const scaleFactor = Math.min(maxWidth / containerWidth, maxHeight / containerHeight, 0.8);

            containerWidth *= scaleFactor;
            containerHeight *= scaleFactor;

            enlargedImageContainer.style.width = `${containerWidth}px`;
            enlargedImageContainer.style.height = `${containerHeight}px`;
        };
    }
});
