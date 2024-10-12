document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    const enlargedImageContainer = document.getElementById('enlarged-image-container');
    const enlargedImage = document.getElementById('enlarged-image');
    const quoteImages = document.querySelectorAll('.quote-image');

    quoteImages.forEach(img => {
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
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    });
});