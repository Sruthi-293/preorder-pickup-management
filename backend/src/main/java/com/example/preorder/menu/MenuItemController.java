package com.example.preorder.menu;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {
    private final MenuItemRepository repo;
    public MenuItemController(MenuItemRepository repo) { this.repo = repo; }

    @GetMapping public List<MenuItem> all() { return repo.findAll(); }
    @GetMapping("/{id}") public MenuItem one(@PathVariable Long id) { return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public MenuItem create(@Valid @RequestBody MenuItem item) { item.setId(null); return repo.save(item); }
    @PutMapping("/{id}") public MenuItem update(@PathVariable Long id, @Valid @RequestBody MenuItem item) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        item.setId(id); return repo.save(item);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        repo.deleteById(id);
    }
}
