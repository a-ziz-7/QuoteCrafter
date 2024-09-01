document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topicInput');
    const generateBtn = document.getElementById('generateBtn');
    const quoteImagesDiv = document.getElementById('quoteImages');
    const loader = document.getElementById('loader');

    generateBtn.addEventListener('click', async () => {
        const topic = topicInput.value.trim();
        if (!topic) return;

        quoteImagesDiv.innerHTML = '';
        loader.classList.remove('hidden');

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (!data.result || !Array.isArray(data.result)) {
                throw new Error('Invalid response format');
            }

            data.result.forEach((item, index) => {
                const quoteImageContainer = document.createElement('div');
                quoteImageContainer.className = 'quote-image-container';

                const img = document.createElement('img');
                img.src = (item.imageUrl);
                img.alt = `Generated image for ${topic}`;
                img.className = 'quote-image';
                const enlargedImageContainer = document.getElementById('enlarged-image-container');
                const enlargedImage = document.getElementById('enlarged-image');
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    enlargedImage.src = img.src;
                    
                    // Set the container size to a smaller version of the natural image size
                    enlargedImage.onload = () => {
                        const imgWidth = enlargedImage.naturalWidth;
                        const imgHeight = enlargedImage.naturalHeight;
                        const maxWidth = window.innerWidth * 0.8; // Reduced from 0.8 to 0.6
                        const maxHeight = window.innerHeight * 0.8; // Reduced from 0.8 to 0.6
                        
                        let containerWidth = imgWidth;
                        let containerHeight = imgHeight;
                        
                        // Always scale down the image to fit within the maxWidth and maxHeight
                        const scaleFactor = Math.min(
                            maxWidth / containerWidth,
                            maxHeight / containerHeight,
                            0.8 // This ensures the image is always scaled down to 80% or less of its original size
                        );
                        
                        containerWidth *= scaleFactor;
                        containerHeight *= scaleFactor;
                        
                        enlargedImageContainer.style.width = `${containerWidth}px`;
                        enlargedImageContainer.style.height = `${containerHeight}px`;
                    };
        
                    overlay.classList.remove('hidden');
                    setTimeout(() => {
                        overlay.classList.add('active');
                    }, 50);
                });

                const quoteText = document.createElement('p');
                quoteText.textContent = item.quote;
                quoteText.className = 'quote-text';

                const downloadBtn = document.createElement('a');
                downloadBtn.href = item.imageUrl;
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
            loader.classList.add('hidden');
        }
    });

    // Add keypress event listener to input field
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateBtn.click();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    });
});