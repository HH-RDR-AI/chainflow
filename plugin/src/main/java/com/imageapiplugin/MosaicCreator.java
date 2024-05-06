package com.imageapiplugin;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.List;

public class MosaicCreator {
    private List<JImage> dependentImages;

    public MosaicCreator(List<JImage> dependentImages) {
        this.dependentImages = dependentImages;
    }

    public JImage findBestMatchingImage(int[] pixelColor) {
        JImage bestMatch = null;
        double minDistance = Double.MAX_VALUE;

        for (JImage img : dependentImages) {
            double distance = JImage.colorDistance(pixelColor, img.getAverageColor());
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = img;
            }
        }
        return bestMatch;
    }

    public BufferedImage createMosaic(JImage hostImage) {
        int width = hostImage.getImage().getWidth();
        int height = hostImage.getImage().getHeight();

        BufferedImage mosaic = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = mosaic.createGraphics();

        g2d.drawImage(hostImage.getImage(), 0, 0, width, height, null);
        g2d.dispose();

        return mosaic;
    }
}
