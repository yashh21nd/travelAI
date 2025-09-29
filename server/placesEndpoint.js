// API endpoint to get specific places based on requirements
app.get('/api/places/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const { requirement } = req.query;
    
    console.log(`Getting places for ${destination} with requirement: ${requirement}`);
    
    if (requirement) {
      const places = getPlacesByRequirement(destination, requirement);
      res.json({
        success: true,
        destination,
        requirement,
        places,
        total: places.length
      });
    } else {
      const allPlaces = getPlacesByCity(destination);
      res.json({
        success: true,
        destination,
        places: allPlaces,
        categories: Object.keys(allPlaces)
      });
    }
  } catch (error) {
    console.error('Error getting places:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get places',
      message: error.message 
    });
  }
});

// Add this to the end of the file before app.listen