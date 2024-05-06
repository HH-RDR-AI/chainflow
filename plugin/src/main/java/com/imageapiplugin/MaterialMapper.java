package com.imageapiplugin;

import org.bukkit.Bukkit;
import org.bukkit.Material;

import java.util.HashMap;
import java.util.Map;

public class MaterialMapper {
    private Map<String, Material> nameToMaterialMap = new HashMap<>();

    public MaterialMapper() {
        for (Material mat : Material.values()) {
            nameToMaterialMap.put(normalize(mat.name()), mat);
        }
    }

    public Material getMaterialFromImageName(String imageName) {
        String normalizedImageName = normalize(imageName.replace(".png", "").replace(".jpg", ""));
        Material material = nameToMaterialMap.get(normalizedImageName);

        if (material == Material.WATER) {
            Bukkit.getLogger().warning("Water block is not a valid choice for image mapping: " + imageName);
            return Material.AIR;
        }

        if (material != null) {
            return material;
        }

        for (Map.Entry<String, Material> entry : nameToMaterialMap.entrySet()) {
            if (normalizedImageName.startsWith(entry.getKey()) || entry.getKey().startsWith(normalizedImageName)) {
                return entry.getValue();
            }
        }

        Bukkit.getLogger().warning("No material found for: " + imageName);
        return Material.AIR;
    }

    private String normalize(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9_]", "");
    }
}
