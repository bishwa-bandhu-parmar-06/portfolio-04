
document.getElementById('downloadResume').addEventListener('click', function() {
    // Replace 'your_resume.pdf' with the actual URL or path to your resume PDF
    var resumeUrl = 'https://drive.google.com/file/d/1VP6W_mvWLYwtFUPMiOAnuuYE7BJHuNFc/view?usp=drive_link';

    // Create a temporary anchor element
    var link = document.createElement('a');
    link.href = resumeUrl;
    link.target = '_blank';

    // Specify the download attribute and trigger a click event
    link.download = 'BishwaBandhuParmar_Resume.pdf';
    link.click();
});
