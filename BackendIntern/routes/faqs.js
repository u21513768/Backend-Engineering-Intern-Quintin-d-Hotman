//Quintin d'Hotman de Villiers u21513768
const express = require('express');
const router = express.Router();
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

const xmlFilePath = path.join(__dirname, './xml/data.xml');

//GET all modules available in the XML
router.get('/modules', (req, res) => {
  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read XML file.' });
    }

    const parser = new xml2js.Parser();
    parser.parseString(data, (err, result
      ) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to parse XML.' });
      }

      const modules = result.faqs.module.map(module => ({
        code: module.$.code,
        name: module.$.name,
      }));

      res.json({ modules });
    });
  });
});

//GET a Module based on the Code of the Module
router.get('/modules/:code', (req, res) => {
  const moduleCode = req.params.code;

  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read XML file.' });
    }

    const parser = new xml2js.Parser();
    parser.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to parse XML.' });
      }

      const module = result.faqs.module.find(module => module.$.code === moduleCode);
      if (!module) {
        return res.status(404).json({ error: 'Module not found.' });
      }

      res.json(module);
    });
  });
});

//POST a new FAQ to a module.
router.post('/', (req, res) => {
  const newFaq = req.body;
  const xmlFilePath = path.join(__dirname, './xml/data.xml');

  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read XML file.' });
    }

    const parser = new xml2js.Parser();
    parser.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to parse XML.' });
      }

      //console.log(newFaq);
      //console.log(result.faqs.module);
      const module = result.faqs.module.find((module) => module.$.code.toUpperCase() === newFaq.moduleCode.toUpperCase());
      if (!module) {
        console.log("Module not found");
        return res.status(404).json({ error: 'Module not found.' });
      }

      //console.log("Module Found");
      const faqs = module.faq || [];
      const lastFaq = faqs[faqs.length - 1];
      const newPriority = lastFaq ? parseInt(lastFaq.$.priority) + 1 : 1;

      const faq = {
        $: {
          priority: newFaq.priority || newPriority,
        },
        tags: {

        },
        question: [
          newFaq.question,
        ],
        answer: [
          newFaq.answer,
        ],
      };

      var tags;
      if (newFaq.tags) {
        tags = newFaq.tags.split(',').map(tag => tag.trim());
        
      }

      faq.tags = [{ tag: tags }];

      module.faq.push(faq);

      const builder = new xml2js.Builder();
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      const xmlStylesheet = '<?xml-stylesheet type="text/xsl" href="project.xsl"?>';
      const xml = builder.buildObject(result);
      const xmlRemove = xml.replace('<\?xml version="1\.0" encoding="UTF-8" standalone="yes"\?>\n', '');

      const finalXmlData = `${xmlHeader}\n${xmlStylesheet}\n${xmlRemove}`;

      fs.writeFile(xmlFilePath, finalXmlData, 'utf8', (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to write XML file.' });
        }

        res.json(module);
      });
    });
  });
});

//PUT updates a specific FAQ based on priority
router.put('/:moduleCode/:priority', (req, res) => {
  const { moduleCode, priority } = req.params;
  const { question, answer } = req.body;
  const xmlFilePath = path.join(__dirname, './xml/data.xml');
  
  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read XML file.' });
    }

    const parser = new xml2js.Parser();
    parser.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to parse XML.' });
      }

      // Update the question and answer tags based on priority
      const module = result.faqs.module.find((module) => module.$.code.toUpperCase() === moduleCode.toUpperCase());
      if (module) {
        const faq = module.faq.find((faq) => faq.$.priority === priority);
        if (faq) {
          faq.question = [question];
          faq.answer = [answer];
        }
      }

      const builder = new xml2js.Builder();
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      const xmlStylesheet = '<?xml-stylesheet type="text/xsl" href="project.xsl"?>';
      const updatedXml = builder.buildObject(result);
      const xmlRemove = updatedXml.replace('<\?xml version="1\.0" encoding="UTF-8" standalone="yes"\?>\n', '');

      const finalXmlData = `${xmlHeader}\n${xmlStylesheet}\n${xmlRemove}`;

      fs.writeFile(xmlFilePath, finalXmlData, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to update FAQ.' });
        }

        res.json(module);
      });
    });
  });
});

// DELETE a specific FAQ based on module code and priority
router.delete('/:moduleCode/:priority', (req, res) => {
  const { moduleCode, priority } = req.params;

  const xmlFilePath = path.join(__dirname, './xml/data.xml');

  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read XML file.' });
    }

    const parser = new xml2js.Parser();
    parser.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to parse XML.' });
      }

      const module = result.faqs.module.find((module) => module.$.code.toUpperCase() === moduleCode.toUpperCase());
      //console.log(module)
      if (module) {
        const faqIndex = module.faq.findIndex((faq) => faq.$.priority === priority);
        if (faqIndex != -1) {
          module.faq.splice(faqIndex, 1);
        }
      }
      else
      {
        console.error(err);
        return res.json({ error: 'Module not found.' });
      }

      const builder = new xml2js.Builder();
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      const xmlStylesheet = '<?xml-stylesheet type="text/xsl" href="project.xsl"?>';
      const updatedXml = builder.buildObject(result);
      const xmlRemove = updatedXml.replace('<\?xml version="1\.0" encoding="UTF-8" standalone="yes"\?>\n', '');

      const finalXmlData = `${xmlHeader}\n${xmlStylesheet}\n${xmlRemove}`;

      fs.writeFile(xmlFilePath, finalXmlData, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to delete FAQ.' });
        }

        res.json(module);
      });
    });
  });
});

//Downloads the xml data.
router.get('/download', (req, res) => {
  fs.readFile(xmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read XML file.' });
    }

    res.attachment('data.xml');
    res.send(data);
  });
});

module.exports = router;
