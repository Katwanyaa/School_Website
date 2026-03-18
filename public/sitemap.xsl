<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>Katwanyaa Senior School - Sitemap</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta name="description" content="Sitemap for A.I.C Katwanyaa Senior School official website"/>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          
          .header h1 span {
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 50px;
            font-size: 0.5em;
            vertical-align: middle;
            margin-left: 15px;
          }
          
          .header p {
            font-size: 1.2em;
            opacity: 0.9;
            margin-bottom: 20px;
          }
          
          .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
          }
          
          .stat-item {
            background: rgba(255,255,255,0.15);
            padding: 15px 25px;
            border-radius: 10px;
            backdrop-filter: blur(5px);
          }
          
          .stat-value {
            font-size: 2em;
            font-weight: bold;
            line-height: 1;
          }
          
          .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .content {
            padding: 30px;
          }
          
          .table-container {
            overflow-x: auto;
            border-radius: 10px;
            border: 1px solid #e0e0e0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
          }
          
          th {
            background: #f8f9fa;
            color: #2c3e50;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid #e0e0e0;
          }
          
          td {
            padding: 15px;
            border-bottom: 1px solid #e0e0e0;
            color: #555;
          }
          
          tr:last-child td {
            border-bottom: none;
          }
          
          tr:hover {
            background: #f8f9fa;
          }
          
          .url {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .url:hover {
            color: #764ba2;
            text-decoration: underline;
          }
          
          .url-icon {
            font-size: 1.2em;
          }
          
          .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 50px;
            font-size: 0.85em;
            font-weight: 500;
            text-transform: capitalize;
          }
          
          .badge.always { background: #e74c3c; color: white; }
          .badge.hourly { background: #f39c12; color: white; }
          .badge.daily { background: #3498db; color: white; }
          .badge.weekly { background: #2ecc71; color: white; }
          .badge.monthly { background: #9b59b6; color: white; }
          .badge.yearly { background: #95a5a6; color: white; }
          .badge.never { background: #7f8c8d; color: white; }
          
          .priority {
            font-weight: 600;
            color: #2c3e50;
          }
          
          .priority-high {
            color: #27ae60;
          }
          
          .priority-medium {
            color: #f39c12;
          }
          
          .priority-low {
            color: #e74c3c;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 0.9em;
          }
          
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
          
          .note {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .note-icon {
            font-size: 1.5em;
          }
          
          @media (max-width: 768px) {
            .header h1 {
              font-size: 1.8em;
            }
            
            .stats {
              flex-direction: column;
              gap: 15px;
            }
            
            .stat-item {
              padding: 10px 20px;
            }
            
            .content {
              padding: 20px;
            }
            
            th, td {
              padding: 10px;
              font-size: 0.9em;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              Katwanyaa Senior School
              <span>Sitemap</span>
            </h1>
            <p>A.I.C Katwanyaa Senior School - Education is Light</p>
            
            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">
                  <xsl:value-of select="count(urlset/url)"/>
                </div>
                <div class="stat-label">Total Pages</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">
                  <xsl:value-of select="count(urlset/url[contains(loc, 'admissions') or contains(loc, 'apply') or contains(loc, 'fees')])"/>
                </div>
                <div class="stat-label">Admissions</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">
                  <xsl:value-of select="count(urlset/url[contains(loc, 'student-portal') or contains(loc, 'guidance') or contains(loc, 'policies')])"/>
                </div>
                <div class="stat-label">Academics</div>
              </div>
            </div>
          </div>
          
          <div class="content">
            <!-- Note about clean URLs -->
            <div class="note">
              <span class="note-icon">📌</span>
              <div>
                <strong>Clean URLs Active:</strong> All pages now use SEO-friendly URLs without /pages folder.
                <br/>
                <small>Example: /about instead of /pages/AboutUs</small>
              </div>
            </div>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Page URL</th>
                    <th>Last Modified</th>
                    <th>Change Frequency</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="urlset/url">
                    <xsl:sort select="priority" data-type="number" order="descending"/>
                    <tr>
                      <td>
                        <a class="url" href="{loc}" target="_blank" rel="noopener">
                          <span class="url-icon">
                            <xsl:choose>
                              <xsl:when test="contains(loc, '/') and string-length(loc) > 25">📄</xsl:when>
                              <xsl:otherwise>🏠</xsl:otherwise>
                            </xsl:choose>
                          </span>
                          <xsl:value-of select="substring-after(loc, 'https://katwanyaasenior.school')"/>
                        </a>
                      </td>
                      <td>
                        <xsl:value-of select="lastmod"/>
                      </td>
                      <td>
                        <span class="badge {changefreq}">
                          <xsl:value-of select="changefreq"/>
                        </span>
                      </td>
                      <td>
                        <span class="priority">
                          <xsl:attribute name="class">
                            <xsl:text>priority </xsl:text>
                            <xsl:choose>
                              <xsl:when test="priority > 0.8">priority-high</xsl:when>
                              <xsl:when test="priority > 0.5">priority-medium</xsl:when>
                              <xsl:otherwise>priority-low</xsl:otherwise>
                            </xsl:choose>
                          </xsl:attribute>
                          <xsl:value-of select="priority"/>
                        </span>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="footer">
            <p>
              <strong>A.I.C Katwanyaa Senior School</strong> | Matungulu, Machakos County, Kenya<br/>
              <a href="https://katwanyaasenior.school">Visit Website</a> | 
              <a href="/contact">Contact Us</a> | 
              <a href="/privacy">Privacy Policy</a><br/>
              <small>Generated: <xsl:value-of select="urlset/url[1]/lastmod"/> | 
                     Next scheduled update: 2026-03-24</small>
            </p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>