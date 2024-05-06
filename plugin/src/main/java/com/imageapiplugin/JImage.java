package com.imageapiplugin;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;

public class JImage {
    private BufferedImage image;
    private int[] averageColor;
    private String filename;

    public JImage(URL imageUrl, String filename) throws IOException {
        this.filename = filename;
        this.image = ImageIO.read(imageUrl);
        if (this.image == null) {
            throw new IOException("Failed to load image from URL: " + imageUrl);
        }
        this.averageColor = calculateAverageColor();
    }

    public JImage(URL imageUrl) throws IOException {
        this.image = ImageIO.read(imageUrl);
        if (this.image == null) {
            throw new IOException("Failed to load image from URL: " + imageUrl);
        }
        this.averageColor = calculateAverageColor();
    }

    public JImage(BufferedImage image, String filename) {
        this.image = image;
        this.averageColor = calculateAverageColor();
        this.filename = filename;
    }

    public JImage(BufferedImage image) {
        this.image = image;
        this.averageColor = calculateAverageColor();
    }

    private int[] calculateAverageColor() {
        if (image == null) {
            return new int[] {0, 0, 0, 0};
        }
        long sumR = 0, sumG = 0, sumB = 0, sumA = 0;
        final int width = image.getWidth();
        final int height = image.getHeight();
        final int total = width * height;

        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                int rgba = image.getRGB(x, y);
                int a = (rgba >> 24) & 0xFF; // Fun bit shift magic
                int r = (rgba >> 16) & 0xFF;
                int g = (rgba >> 8) & 0xFF;
                int b = rgba & 0xFF;

                sumA += a;
                sumR += r;
                sumG += g;
                sumB += b;
            }
        }

        return new int[]{(int) (sumR / total), (int) (sumG / total), (int) (sumB / total), (int) (sumA / total)};
    }

    public BufferedImage getImage() {
        return image;
    }

    public int[] getAverageColor() {
        return averageColor;
    }

    public static double colorDistance(int[] color1, int[] color2) {
        return Math.sqrt(Math.pow(color2[0] - color1[0], 2) +
                Math.pow(color2[1] - color1[1], 2) +
                Math.pow(color2[2] - color1[2], 2) +
                Math.pow(color2[3] - color1[3], 2));
    }

    public String getFileName() {
        return filename;
    }
}
