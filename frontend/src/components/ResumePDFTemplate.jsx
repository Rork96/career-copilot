import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

/**
 * ResumePDFTemplate
 * A clean, single-column, ATS-compliant template for PDF generation.
 * Adheres to Canadian "ATS-Gold" standards: No graphics, tables, or colors.
 * Uses standard fonts and a clear hierarchy.
 */
const ResumePDFTemplate = ({ resumeData }) => {
    // Basic styles for the PDF rendering
    // These will be rendered into the hidden element before html2pdf captures it.
    const containerStyle = {
        fontFamily: '"Helvetica", "Arial", sans-serif',
        fontSize: '11pt',
        lineHeight: '1.4',
        color: '#000',
        padding: '0.5in', // Standard margins
        backgroundColor: '#fff',
        width: '8.5in', // Standard US Letter width
        margin: '0 auto',
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '20px',
    };

    const nameStyle = {
        fontSize: '18pt',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: '5px',
    };

    const contactStyle = {
        fontSize: '10pt',
        marginBottom: '20px',
    };

    const sectionHeaderStyle = {
        fontSize: '12pt',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottom: '1px solid #000',
        marginTop: '15px',
        marginBottom: '10px',
    };

    const contentStyle = {
        textAlign: 'justify',
    };

    // Note: Since the resumeData is markdown, we rely on ReactMarkdown to 
    // render the hierarchy. We can override components for specific styling.

    return (
        <div id="resume-pdf-template" style={containerStyle}>
            <div style={contentStyle} className="ats-resume-content">
                <ReactMarkdown
                    components={{
                        // Ensure headers follow the ATS-Gold standard
                        h1: ({ children }) => <h1 style={nameStyle}>{children}</h1>,
                        h2: ({ children }) => <h2 style={sectionHeaderStyle}>{children}</h2>,
                        h3: ({ children }) => <h3 style={{ fontSize: '11pt', fontWeight: 'bold', margin: '10px 0 5px' }}>{children}</h3>,
                        p: ({ children }) => <p style={{ marginBottom: '8px' }}>{children}</p>,
                        ul: ({ children }) => <ul style={{ marginLeft: '20px', marginBottom: '10px', listStyleType: 'disc' }}>{children}</ul>,
                        li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                        strong: ({ children }) => <strong style={{ fontWeight: 'bold' }}>{children}</strong>,
                    }}
                >
                    {resumeData}
                </ReactMarkdown>
            </div>
        </div>
    );
};

ResumePDFTemplate.propTypes = {
    resumeData: PropTypes.string.isRequired,
};

export default ResumePDFTemplate;
